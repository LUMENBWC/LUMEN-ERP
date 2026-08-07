import { Inject, Injectable } from '@nestjs/common';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import {
  TENANT_TRANSACTION_RUNNER,
  type TenantTransactionRunner,
} from '../../../../infra/prisma/tenant-transaction-runner';
import type { ListarSessoesQueryDto } from '../dto/listar-sessoes.query.dto';
import {
  CAIXA_REPOSITORY_FACTORY,
  type CaixaRepositoryFactory,
} from '../ports/caixa-repository.factory';
import type { ListarSessoesResultado } from '../ports/caixa.repository.port';

@Injectable()
export class ListarSessoesUseCase {
  constructor(
    @Inject(TENANT_TRANSACTION_RUNNER) private readonly txRunner: TenantTransactionRunner,
    @Inject(CAIXA_REPOSITORY_FACTORY) private readonly repoFactory: CaixaRepositoryFactory,
  ) {}

  async execute(
    tenant: TenantContext,
    query: ListarSessoesQueryDto,
  ): Promise<ListarSessoesResultado> {
    return this.txRunner.run(tenant.empresaId, async (tx) => {
      const repo = this.repoFactory(tx, tenant.empresaId);
      return repo.listarSessoes(query);
    });
  }
}
