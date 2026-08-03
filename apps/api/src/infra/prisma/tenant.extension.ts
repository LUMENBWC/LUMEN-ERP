import { Prisma } from '../../../generated/prisma/client';
import { injectEmpresaId } from './inject-empresa-id';
import { isTenantScopedModel } from './tenant-scoped-models';

/**
 * Scopes every query against a tenant-scoped model to `empresaId`, both on
 * reads (`where`) and writes (`data`). This is the application-level layer
 * of tenant isolation; RLS (see ADR-0002) is the database-level layer.
 */
export function withTenantScope(empresaId: string) {
  return Prisma.defineExtension({
    name: 'tenant-scope',
    query: {
      $allModels: {
        $allOperations({ model, operation, args, query }) {
          if (!isTenantScopedModel(model)) {
            return query(args);
          }
          return query(injectEmpresaId(operation, args as Record<string, unknown>, empresaId));
        },
      },
    },
  });
}
