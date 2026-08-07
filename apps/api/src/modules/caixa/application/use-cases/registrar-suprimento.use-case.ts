import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { CaixaNaoAbertoError } from '../../domain/caixa.errors';
import type { SuprimentoDto } from '../dto/suprimento.dto';
import {
  CAIXA_REPOSITORY_FACTORY,
  type CaixaRepositoryFactory,
} from '../ports/caixa-repository.factory';

@Injectable()
export class RegistrarSuprimentoUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(CAIXA_REPOSITORY_FACTORY) private readonly repoFactory: CaixaRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, dto: SuprimentoDto): Promise<void> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const sessao = await repo.sessaoAbertaDaEmpresa();
      if (!sessao) {
        throw new CaixaNaoAbertoError();
      }

      const valor = new Prisma.Decimal(dto.valor);
      await repo.registrarMovimento(
        { caixaSessaoId: sessao.id, tipo: 'SUPRIMENTO', valor, descricao: dto.motivo },
        tenant.usuarioId,
      );

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'CaixaSessao',
        entidadeId: sessao.id,
        acao: 'SUPRIMENTO',
        dadosDepois: { valor: dto.valor, motivo: dto.motivo },
      });
    });
  }
}
