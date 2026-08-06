import type { TenantScopedPrismaClient } from '../../../../infra/prisma/run-in-tenant-context';
import type { EstoqueRepositoryPort } from './estoque.repository.port';

export type EstoqueRepositoryFactory = (
  tx: TenantScopedPrismaClient,
  empresaId: string,
) => EstoqueRepositoryPort;

export const ESTOQUE_REPOSITORY_FACTORY = Symbol('ESTOQUE_REPOSITORY_FACTORY');
