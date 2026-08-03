import { PrismaService } from './prisma.service';
import { withTenantScope } from './tenant.extension';

/**
 * Runs `fn` inside a single Postgres transaction scoped to `empresaId`:
 *
 * 1. Sets the `app.empresa_id` session variable (`set_config(..., true)`
 *    scopes it to the transaction), which the RLS policies in
 *    20260803005036_roles_rls_auth_fk read via `current_setting`.
 * 2. Hands `fn` a Prisma client extended with {@link withTenantScope}, so
 *    every query is also scoped at the application level.
 *
 * The extension is applied *before* opening the transaction - `$extends`
 * isn't available on a transaction client, but a transaction opened on an
 * already-extended client carries the extension through. `set_config` and
 * the queries in `fn` must share one physical connection for RLS to see the
 * session variable - `$transaction` guarantees that even through
 * Supavisor's transaction-mode pooler.
 */
function scopeClient(prisma: PrismaService, empresaId: string) {
  return prisma.$extends(withTenantScope(empresaId));
}

type ScopedClient = ReturnType<typeof scopeClient>;
export type TenantScopedPrismaClient = Parameters<Parameters<ScopedClient['$transaction']>[0]>[0];

export async function runInTenantContext<T>(
  prisma: PrismaService,
  empresaId: string,
  fn: (tx: TenantScopedPrismaClient) => Promise<T>,
): Promise<T> {
  const scoped = scopeClient(prisma, empresaId);
  return scoped.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.empresa_id', ${empresaId}, true)`;
    return fn(tx);
  });
}
