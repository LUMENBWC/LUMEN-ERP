import type { TenantScopedPrismaClient } from '../../../../infra/prisma/run-in-tenant-context';
import type { OrcamentosRepositoryPort } from './orcamentos.repository.port';

export type OrcamentosRepositoryFactory = (
  tx: TenantScopedPrismaClient,
  empresaId: string,
) => OrcamentosRepositoryPort;

export const ORCAMENTOS_REPOSITORY_FACTORY = Symbol('ORCAMENTOS_REPOSITORY_FACTORY');
