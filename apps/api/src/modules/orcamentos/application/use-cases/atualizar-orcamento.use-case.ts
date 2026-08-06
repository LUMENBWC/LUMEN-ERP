import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { calcularTotaisOrcamento } from '../../domain/calcular-totais-orcamento';
import {
  OrcamentoNaoEditavelError,
  OrcamentoNaoEncontradoError,
} from '../../domain/orcamento.errors';
import type { CriarOrcamentoDto } from '../dto/criar-orcamento.dto';
import {
  ORCAMENTOS_REPOSITORY_FACTORY,
  type OrcamentosRepositoryFactory,
} from '../ports/orcamentos-repository.factory';
import type { OrcamentoDetalhado } from '../ports/orcamentos.repository.port';
import { validarClienteEProdutos } from '../validar-cliente-e-produtos';

@Injectable()
export class AtualizarOrcamentoUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(ORCAMENTOS_REPOSITORY_FACTORY)
    private readonly repoFactory: OrcamentosRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(
    tenant: TenantContext,
    id: string,
    dto: CriarOrcamentoDto,
  ): Promise<OrcamentoDetalhado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const atual = await repo.obterPorId(id);
      if (!atual) {
        throw new OrcamentoNaoEncontradoError();
      }
      if (atual.status !== 'RASCUNHO') {
        throw new OrcamentoNaoEditavelError();
      }

      await validarClienteEProdutos(
        repo,
        dto.clienteId,
        dto.itens.map((item) => item.produtoId),
      );

      const { itens, subtotal, total } = calcularTotaisOrcamento(
        dto.itens.map((item) => ({
          quantidade: new Prisma.Decimal(item.quantidade),
          precoUnitario: new Prisma.Decimal(item.precoUnitario),
          desconto: new Prisma.Decimal(item.desconto),
        })),
        new Prisma.Decimal(dto.descontoGeral),
      );

      const orcamento = await repo.atualizar(
        id,
        {
          clienteId: dto.clienteId,
          itens: itens.map((item, index) => ({
            produtoId: dto.itens[index]!.produtoId,
            ...item,
          })),
          descontoGeral: new Prisma.Decimal(dto.descontoGeral),
          subtotal,
          total,
          validade: dto.validade,
          observacoes: dto.observacoes,
        },
        tenant.usuarioId,
      );

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'Orcamento',
        entidadeId: orcamento.id,
        acao: 'ATUALIZAR',
        dadosAntes: atual,
        dadosDepois: orcamento,
      });

      return orcamento;
    });
  }
}
