import type { TenantScopedPrismaClient } from '../../../../infra/prisma/run-in-tenant-context';
import type { FinanceiroRepositoryPort } from './financeiro.repository.port';

export type FinanceiroRepositoryFactory = (
  tx: TenantScopedPrismaClient,
  empresaId: string,
) => FinanceiroRepositoryPort;

export const FINANCEIRO_REPOSITORY_FACTORY = Symbol('FINANCEIRO_REPOSITORY_FACTORY');
