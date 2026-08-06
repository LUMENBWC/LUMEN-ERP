import type { TenantScopedPrismaClient } from '../../../../infra/prisma/run-in-tenant-context';
import type { CategoriasRepositoryPort } from './categorias.repository.port';

export type CategoriasRepositoryFactory = (
  tx: TenantScopedPrismaClient,
  empresaId: string,
) => CategoriasRepositoryPort;

export const CATEGORIAS_REPOSITORY_FACTORY = Symbol('CATEGORIAS_REPOSITORY_FACTORY');
