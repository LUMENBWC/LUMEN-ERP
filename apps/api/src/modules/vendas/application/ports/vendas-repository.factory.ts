import type { TenantScopedPrismaClient } from '../../../../infra/prisma/run-in-tenant-context';
import type { VendasRepositoryPort } from './vendas.repository.port';

export type VendasRepositoryFactory = (
  tx: TenantScopedPrismaClient,
  empresaId: string,
) => VendasRepositoryPort;

export const VENDAS_REPOSITORY_FACTORY = Symbol('VENDAS_REPOSITORY_FACTORY');
