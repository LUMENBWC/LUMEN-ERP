import type { TenantScopedPrismaClient } from '../../../../infra/prisma/run-in-tenant-context';
import type { CaixaRepositoryPort } from './caixa.repository.port';

export type CaixaRepositoryFactory = (
  tx: TenantScopedPrismaClient,
  empresaId: string,
) => CaixaRepositoryPort;

export const CAIXA_REPOSITORY_FACTORY = Symbol('CAIXA_REPOSITORY_FACTORY');
