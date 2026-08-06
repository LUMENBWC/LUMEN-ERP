import type { TenantScopedPrismaClient } from '../../../../infra/prisma/run-in-tenant-context';
import type { ProdutosRepositoryPort } from './produtos.repository.port';

export type ProdutosRepositoryFactory = (
  tx: TenantScopedPrismaClient,
  empresaId: string,
) => ProdutosRepositoryPort;

export const PRODUTOS_REPOSITORY_FACTORY = Symbol('PRODUTOS_REPOSITORY_FACTORY');
