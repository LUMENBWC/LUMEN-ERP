import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import {
  CAIXA_REPOSITORY_FACTORY,
  type CaixaRepositoryFactory,
} from '../../../caixa/application/ports/caixa-repository.factory';
import { calcularSaldoAposDelta } from '../../../estoque/domain/calcular-saldo-apos-delta';
import {
  ESTOQUE_REPOSITORY_FACTORY,
  type EstoqueRepositoryFactory,
} from '../../../estoque/application/ports/estoque-repository.factory';
import {
  ORCAMENTOS_REPOSITORY_FACTORY,
  type OrcamentosRepositoryFactory,
} from '../../../orcamentos/application/ports/orcamentos-repository.factory';
import { calcularParcelas } from '../../domain/calcular-parcelas';
import { calcularTotaisVenda, type ItemVendaInput } from '../../domain/calcular-totais-venda';
import { garantirPagamentosValidos } from '../../domain/garantir-pagamentos-validos';
import {
  CaixaFechadoError,
  ClienteInvalidoError,
  DescontoNaoAutorizadoError,
  EstoqueInsuficienteError,
  OrcamentoInvalidoError,
  OrcamentoNaoConversivelError,
  ProdutoInvalidoError,
} from '../../domain/venda.errors';
import type { FinalizarVendaDto } from '../dto/finalizar-venda.dto';
import {
  VENDAS_REPOSITORY_FACTORY,
  type VendasRepositoryFactory,
} from '../ports/vendas-repository.factory';
import type {
  ContaReceberParaSalvar,
  PagamentoParaSalvar,
  VendaDetalhada,
} from '../ports/vendas.repository.port';

const FORMAS_A_VISTA = new Set(['DINHEIRO', 'PIX', 'DEBITO', 'CREDITO']);
const FORMAS_PARCELADAS = new Set(['CREDITO_PARCELADO', 'A_PRAZO']);

interface ItemOrigem {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  desconto: number;
}

@Injectable()
export class FinalizarVendaUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(VENDAS_REPOSITORY_FACTORY) private readonly vendasRepoFactory: VendasRepositoryFactory,
    @Inject(ESTOQUE_REPOSITORY_FACTORY)
    private readonly estoqueRepoFactory: EstoqueRepositoryFactory,
    @Inject(CAIXA_REPOSITORY_FACTORY) private readonly caixaRepoFactory: CaixaRepositoryFactory,
    @Inject(ORCAMENTOS_REPOSITORY_FACTORY)
    private readonly orcamentosRepoFactory: OrcamentosRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, dto: FinalizarVendaDto): Promise<VendaDetalhada> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const vendasRepo = this.vendasRepoFactory(tx, tenant.empresaId);
      const estoqueRepo = this.estoqueRepoFactory(tx, tenant.empresaId);
      const caixaRepo = this.caixaRepoFactory(tx, tenant.empresaId);

      let clienteId = dto.clienteId;
      let itensOrigem: ItemOrigem[] = dto.itens;
      let descontoGeral = dto.descontoGeral;

      if (dto.orcamentoId) {
        const orcamentosRepo = this.orcamentosRepoFactory(tx, tenant.empresaId);
        const orcamento = await orcamentosRepo.obterPorId(dto.orcamentoId);
        if (!orcamento) {
          throw new OrcamentoInvalidoError();
        }
        if (orcamento.status !== 'APROVADO') {
          throw new OrcamentoNaoConversivelError();
        }

        clienteId = orcamento.clienteId;
        itensOrigem = orcamento.itens.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade.toNumber(),
          precoUnitario: item.precoUnitario.toNumber(),
          desconto: item.desconto.toNumber(),
        }));
        descontoGeral = orcamento.descontoGeral.toNumber();
      }

      if (clienteId && !(await vendasRepo.clienteExiste(clienteId))) {
        throw new ClienteInvalidoError();
      }

      const temDesconto = descontoGeral > 0 || itensOrigem.some((item) => item.desconto > 0);
      if (temDesconto && !tenant.permissoes.has('vendas.aplicarDesconto')) {
        throw new DescontoNaoAutorizadoError();
      }

      const produtoIds = [...new Set(itensOrigem.map((item) => item.produtoId))].sort();
      const produtos = await vendasRepo.obterProdutosComLock(produtoIds);
      for (const produtoId of produtoIds) {
        if (!produtos.has(produtoId)) {
          throw new ProdutoInvalidoError(produtoId);
        }
      }

      const itensParaCalculo: ItemVendaInput[] = itensOrigem.map((item) => {
        const produto = produtos.get(item.produtoId)!;
        return {
          produtoId: item.produtoId,
          quantidade: new Prisma.Decimal(item.quantidade),
          precoUnitario: new Prisma.Decimal(item.precoUnitario),
          desconto: new Prisma.Decimal(item.desconto),
          custoUnitario: produto.precoCusto,
        };
      });

      const saldoAposPorProduto = new Map<string, Prisma.Decimal>();
      for (const item of itensParaCalculo) {
        const produto = produtos.get(item.produtoId)!;
        const saldoApos = calcularSaldoAposDelta(
          produto.estoqueAtual,
          item.quantidade.negated(),
          true,
        );
        if (saldoApos.isNegative()) {
          throw new EstoqueInsuficienteError(produto.nome);
        }
        saldoAposPorProduto.set(item.produtoId, saldoApos);
      }

      const { itens, subtotal, total, custoTotal } = calcularTotaisVenda(
        itensParaCalculo,
        new Prisma.Decimal(descontoGeral),
      );

      const pagamentos: PagamentoParaSalvar[] = dto.pagamentos.map((pagamento) => ({
        formaPagamento: pagamento.formaPagamento,
        valor: new Prisma.Decimal(pagamento.valor),
        parcelas: pagamento.parcelas,
        bandeira: pagamento.bandeira,
      }));
      garantirPagamentosValidos(pagamentos, total);

      const valorDinheiro = pagamentos
        .filter((p) => p.formaPagamento === 'DINHEIRO')
        .reduce((acc, p) => acc.plus(p.valor), new Prisma.Decimal(0));

      let caixaSessaoId: string | null = null;
      if (valorDinheiro.greaterThan(0)) {
        const sessaoAberta = await caixaRepo.sessaoAbertaDaEmpresa();
        if (!sessaoAberta) {
          throw new CaixaFechadoError();
        }
        caixaSessaoId = sessaoAberta.id;
      }

      const agora = new Date();
      const contasReceber: ContaReceberParaSalvar[] = pagamentos.flatMap(
        (pagamento): ContaReceberParaSalvar[] => {
          if (FORMAS_A_VISTA.has(pagamento.formaPagamento)) {
            return [
              {
                descricao: `Venda - ${pagamento.formaPagamento}`,
                valorTotal: pagamento.valor,
                valorRecebido: pagamento.valor,
                vencimento: agora,
                status: 'PAGO' as const,
                parcelaNumero: null,
                parcelaTotal: null,
                formaPagamento: pagamento.formaPagamento,
              },
            ];
          }
          if (FORMAS_PARCELADAS.has(pagamento.formaPagamento)) {
            const parcelas = calcularParcelas(pagamento.valor, pagamento.parcelas ?? 1, agora);
            return parcelas.map((parcela) => ({
              descricao: `Venda - ${pagamento.formaPagamento} ${parcela.numero}/${parcela.total}`,
              valorTotal: parcela.valor,
              valorRecebido: new Prisma.Decimal(0),
              vencimento: parcela.vencimento,
              status: 'ABERTO' as const,
              parcelaNumero: parcela.numero,
              parcelaTotal: parcela.total,
              formaPagamento: pagamento.formaPagamento,
            }));
          }
          return [];
        },
      );

      const venda = await vendasRepo.criar(
        {
          clienteId,
          orcamentoId: dto.orcamentoId,
          caixaSessaoId,
          itens: itens.map((item) => ({ ...item, produtoId: item.produtoId })),
          pagamentos,
          contasReceber,
          descontoGeral: new Prisma.Decimal(descontoGeral),
          subtotal,
          total,
          custoTotal,
        },
        tenant.usuarioId,
      );

      if (dto.orcamentoId) {
        const orcamentosRepo = this.orcamentosRepoFactory(tx, tenant.empresaId);
        await orcamentosRepo.atualizarStatus(dto.orcamentoId, 'CONVERTIDO', tenant.usuarioId);
      }

      for (const item of itens) {
        await estoqueRepo.registrarDelta(
          {
            produtoId: item.produtoId,
            tipo: 'SAIDA_VENDA',
            delta: item.quantidade.negated(),
            saldoApos: saldoAposPorProduto.get(item.produtoId)!,
            motivo: null,
            origemTipo: 'Venda',
            origemId: venda.id,
          },
          tenant.usuarioId,
        );
      }

      if (caixaSessaoId && valorDinheiro.greaterThan(0)) {
        await caixaRepo.registrarMovimento(
          {
            caixaSessaoId,
            tipo: 'VENDA',
            valor: valorDinheiro,
            descricao: `Venda ${venda.id}`,
            origemTipo: 'Venda',
            origemId: venda.id,
          },
          tenant.usuarioId,
        );
      }

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'Venda',
        entidadeId: venda.id,
        acao: 'FINALIZAR',
        dadosDepois: venda,
      });

      return venda;
    });
  }
}
