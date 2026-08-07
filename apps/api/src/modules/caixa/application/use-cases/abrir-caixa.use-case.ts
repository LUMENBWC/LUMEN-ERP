import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import { CaixaJaAbertoError } from '../../domain/caixa.errors';
import type { AbrirCaixaDto } from '../dto/abrir-caixa.dto';
import {
  CAIXA_REPOSITORY_FACTORY,
  type CaixaRepositoryFactory,
} from '../ports/caixa-repository.factory';
import type { CaixaSessaoResumo } from '../ports/caixa.repository.port';

@Injectable()
export class AbrirCaixaUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(CAIXA_REPOSITORY_FACTORY) private readonly repoFactory: CaixaRepositoryFactory,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(tenant: TenantContext, dto: AbrirCaixaDto): Promise<CaixaSessaoResumo> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);

      const sessaoAberta = await repo.sessaoAbertaDaEmpresa();
      if (sessaoAberta) {
        throw new CaixaJaAbertoError();
      }

      const valorAbertura = new Prisma.Decimal(dto.valorAbertura);
      const sessao = await repo.abrir({ valorAbertura }, tenant.usuarioId);

      await repo.registrarMovimento(
        {
          caixaSessaoId: sessao.id,
          tipo: 'ABERTURA',
          valor: valorAbertura,
          descricao: 'Abertura de caixa',
        },
        tenant.usuarioId,
      );

      await this.auditLog.record(tx, tenant.empresaId, {
        usuarioId: tenant.usuarioId,
        entidade: 'CaixaSessao',
        entidadeId: sessao.id,
        acao: 'ABRIR',
        dadosDepois: sessao,
      });

      return sessao;
    });
  }
}
