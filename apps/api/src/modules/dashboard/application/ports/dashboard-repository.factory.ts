import type { TenantScopedPrismaClient } from '../../../../infra/prisma/run-in-tenant-context';
import type { DashboardRepositoryPort } from './dashboard.repository.port';

export type DashboardRepositoryFactory = (
  tx: TenantScopedPrismaClient,
  empresaId: string,
) => DashboardRepositoryPort;

export const DASHBOARD_REPOSITORY_FACTORY = Symbol('DASHBOARD_REPOSITORY_FACTORY');
