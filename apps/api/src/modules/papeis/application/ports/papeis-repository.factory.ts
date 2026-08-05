import type { TenantScopedPrismaClient } from '../../../../infra/prisma/run-in-tenant-context';
import type { PapeisRepositoryPort } from './papeis.repository.port';

export type PapeisRepositoryFactory = (tx: TenantScopedPrismaClient) => PapeisRepositoryPort;

export const PAPEIS_REPOSITORY_FACTORY = Symbol('PAPEIS_REPOSITORY_FACTORY');
