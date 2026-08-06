import type { TenantScopedPrismaClient } from '../../../../infra/prisma/run-in-tenant-context';
import type { FornecedoresRepositoryPort } from './fornecedores.repository.port';

export type FornecedoresRepositoryFactory = (
  tx: TenantScopedPrismaClient,
  empresaId: string,
) => FornecedoresRepositoryPort;

export const FORNECEDORES_REPOSITORY_FACTORY = Symbol('FORNECEDORES_REPOSITORY_FACTORY');
