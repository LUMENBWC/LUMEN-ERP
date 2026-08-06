import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { calcularSaldoAposDelta } from '../../domain/calcular-saldo-apos-delta';
import { ProdutoNaoEncontradoError } from '../../domain/estoque.errors';
import type { RegistrarAjusteDto } from '../dto/registrar-ajuste.dto';
import {
  ESTOQUE_REPOSITORY_FACTORY,
  type EstoqueRepositoryFactory,
} from '../ports/estoque-repository.factory';
import type { MovimentacaoResumo } from '../ports/estoque.repository.port';

@Injectable()
export class RegistrarAjusteUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(ESTOQUE_REPOSITORY_FACTORY) private readonly repoFactory: EstoqueRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, dto: RegistrarAjusteDto): Promise<MovimentacaoResumo> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const produto = await repo.obterProdutoComLock(dto.produtoId);
      if (!produto) {
        throw new ProdutoNaoEncontradoError();
      }

      const delta = new Prisma.Decimal(dto.quantidade);
      const permitirNegativo = tenant.permissoes.has('estoque.ajustarNegativo');
      const saldoApos = calcularSaldoAposDelta(produto.estoqueAtual, delta, permitirNegativo);

      const movimentacao = await repo.registrarDelta(
        {
          produtoId: dto.produtoId,
          tipo: 'AJUSTE_MANUAL',
          delta,
          saldoApos,
          motivo: dto.motivo,
        },
        tenant.usuarioId,
      );

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'MovimentacaoEstoque',
        entidadeId: movimentacao.id,
        acao: 'AJUSTE_MANUAL',
        dadosDepois: movimentacao,
      });

      return movimentacao;
    });
  }
}
