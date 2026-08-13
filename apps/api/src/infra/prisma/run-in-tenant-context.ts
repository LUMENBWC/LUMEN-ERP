import { PrismaService } from './prisma.service';
import { withTenantScope } from './tenant.extension';
import { withPooledClient } from './with-pooled-client';

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
  // Connection hygiene, not the fix for `invalid input syntax for type
  // uuid: ""` (see ADR-0005 - that's a NULLIF guard in the RLS policies
  // themselves, since DISCARD ALL/RESET ALL can't clean a custom GUC
  // already stuck at ''). DISCARD ALL can't run inside a transaction
  // block, and Prisma's interactive $transaction doesn't give us a hook
  // that runs before its own BEGIN - so it's issued here, on its own round
  // trip, immediately before starting the transaction. `pg.Pool` hands out
  // its most-recently-released idle client first, so this reliably lands
  // on the same connection $transaction acquires next in the
  // (low-concurrency) common case; unlike the 'acquire' event this at
  // least has correct ordering guarantees for its own connection when it
  // does line up.
  // `withPooledClient` garante o release mesmo se o DISCARD falhar (antes,
  // um throw aqui vazava a conexão) e anexa o listener de 'error' que evita
  // que uma conexão derrubada pelo pooler mate o processo.
  await withPooledClient(prisma.pgPool, (warmup) => warmup.query('DISCARD ALL'));

  const scoped = scopeClient(prisma, empresaId);
  return scoped.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.empresa_id', ${empresaId}, true)`;
      return fn(tx);
    },
    // Default do Prisma é timeout: 5000ms - baixo demais pros fluxos que
    // fazem várias queries sequenciais na mesma transação sob latência de
    // rede real (ex.: finalizar venda convertendo um orçamento: busca o
    // orçamento, trava produtos, cria a venda, N deltas de estoque,
    // movimento de caixa, atualiza status do orçamento, audit log - visto
    // estourar 5s contra o pooler do Supabase nos testes e2e).
    { timeout: 15000, maxWait: 5000 },
  );
}
