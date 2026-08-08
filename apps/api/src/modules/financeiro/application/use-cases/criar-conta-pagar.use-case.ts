import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import {
  CategoriaDespesaNaoEncontradaError,
  FornecedorInvalidoError,
} from '../../domain/financeiro.errors';
import type { CriarContaPagarDto } from '../dto/criar-conta-pagar.dto';
import {
  FINANCEIRO_REPOSITORY_FACTORY,
  type FinanceiroRepositoryFactory,
} from '../ports/financeiro-repository.factory';
import type { ContaPagarDetalhada } from '../ports/financeiro.repository.port';

@Injectable()
export class CriarContaPagarUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(FINANCEIRO_REPOSITORY_FACTORY)
    private readonly repoFactory: FinanceiroRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, dto: CriarContaPagarDto): Promise<ContaPagarDetalhada> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      if (dto.fornecedorId && !(await repo.fornecedorExiste(dto.fornecedorId))) {
        throw new FornecedorInvalidoError();
      }
      if (dto.categoriaDespesaId && !(await repo.categoriaDespesaExiste(dto.categoriaDespesaId))) {
        throw new CategoriaDespesaNaoEncontradaError();
      }

      const conta = await repo.criarContaPagar(
        {
          fornecedorId: dto.fornecedorId,
          categoriaDespesaId: dto.categoriaDespesaId,
          descricao: dto.descricao,
          valorTotal: new Prisma.Decimal(dto.valorTotal),
          vencimento: dto.vencimento,
        },
        tenant.usuarioId,
      );

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'ContaPagar',
        entidadeId: conta.id,
        acao: 'CRIAR',
        dadosDepois: conta,
      });

      return conta;
    });
  }
}
