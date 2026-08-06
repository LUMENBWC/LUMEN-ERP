import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { calcularTotaisOrcamento } from '../../domain/calcular-totais-orcamento';
import { validarClienteEProdutos } from '../validar-cliente-e-produtos';
import type { CriarOrcamentoDto } from '../dto/criar-orcamento.dto';
import {
  ORCAMENTOS_REPOSITORY_FACTORY,
  type OrcamentosRepositoryFactory,
} from '../ports/orcamentos-repository.factory';
import type { OrcamentoDetalhado } from '../ports/orcamentos.repository.port';

@Injectable()
export class CriarOrcamentoUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(ORCAMENTOS_REPOSITORY_FACTORY)
    private readonly repoFactory: OrcamentosRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, dto: CriarOrcamentoDto): Promise<OrcamentoDetalhado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

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

      const orcamento = await repo.criar(
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
        acao: 'CRIAR',
        dadosDepois: orcamento,
      });

      return orcamento;
    });
  }
}
