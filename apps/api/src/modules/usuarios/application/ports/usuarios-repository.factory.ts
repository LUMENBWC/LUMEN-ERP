import type { TenantScopedPrismaClient } from '../../../../infra/prisma/run-in-tenant-context';
import type { UsuariosRepositoryPort } from './usuarios.repository.port';

export type UsuariosRepositoryFactory = (
  tx: TenantScopedPrismaClient,
  empresaId: string,
) => UsuariosRepositoryPort;

export const USUARIOS_REPOSITORY_FACTORY = Symbol('USUARIOS_REPOSITORY_FACTORY');
