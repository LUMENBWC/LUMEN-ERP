import type { TenantScopedPrismaClient } from '../../../../infra/prisma/run-in-tenant-context';
import type { ClientesRepositoryPort } from './clientes.repository.port';

export type ClientesRepositoryFactory = (
  tx: TenantScopedPrismaClient,
  empresaId: string,
) => ClientesRepositoryPort;

export const CLIENTES_REPOSITORY_FACTORY = Symbol('CLIENTES_REPOSITORY_FACTORY');
