import { PrismaService } from '../../infra/prisma/prisma.service';

export interface TenantContext {
  authUserId: string;
  usuarioId: string;
  empresaId: string;
  filialId: string | null;
  nome: string;
  email: string;
  papeis: string[];
  permissoes: Set<string>;
}

/**
 * Bootstraps identity for a verified Supabase Auth user: which empresa they
 * belong to and which permissions they hold. Two separate transactions on
 * two separate `pg` pools, because RLS gates each step differently (see
 * migration 20260803224008_usuarios_self_lookup and ADR-0002):
 *
 * 1. On `prisma.authBootstrapPool`, set `app.auth_user_id` and look up
 *    `usuarios` via the self_lookup policy - `app.empresa_id` isn't known
 *    yet at this point.
 * 2. Now that `empresaId` is known, on `prisma.pgPool` set `app.empresa_id`
 *    and read the user's papeis/permissoes through the normal
 *    tenant_isolation policy.
 *
 * These MUST stay on two separate pools, each dedicated to a single custom
 * GUC name - see ADR-0003 and the doc comments on both pools in
 * `PrismaService`. Confirmed by direct load testing: once a pooled Postgres
 * backend behind Supavisor has been used to set two *different* local GUC
 * names (even across separate transactions), `current_setting()` starts
 * returning `''` instead of the value just set, breaking every subsequent
 * query gated by an RLS policy that reads it - this is what caused the
 * intermittent `invalid input syntax for type uuid: ""` 500s on `/me`.
 *
 * Also bypasses Prisma's query layer (raw `pg` instead of
 * `prisma.$queryRaw`/model queries): needed exclusive, hand-controlled
 * connections to reproduce and pin down the above, and there's no upside to
 * routing back through Prisma now that it's understood.
 */
export async function resolveTenantContext(
  prisma: PrismaService,
  authUserId: string,
): Promise<TenantContext | null> {
  const usuario = await lookupUsuarioByAuthUserId(prisma, authUserId);
  if (!usuario) {
    return null;
  }

  const { papeis, permissoes } = await lookupPapeisEPermissoes(
    prisma,
    usuario.id,
    usuario.empresaId,
  );

  return {
    authUserId,
    usuarioId: usuario.id,
    empresaId: usuario.empresaId,
    filialId: usuario.filialId,
    nome: usuario.nome,
    email: usuario.email,
    papeis,
    permissoes,
  };
}

async function lookupUsuarioByAuthUserId(prisma: PrismaService, authUserId: string) {
  const client = await prisma.authBootstrapPool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.auth_user_id', $1, true)", [authUserId]);

    const result = await client.query<{
      id: string;
      empresaId: string;
      filialId: string | null;
      nome: string;
      email: string;
    }>(
      `SELECT id, "empresaId", "filialId", nome, email
       FROM usuarios
       WHERE "authUserId" = $1::uuid AND ativo = true
       LIMIT 1`,
      [authUserId],
    );

    await client.query('COMMIT');
    return result.rows[0] ?? null;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

async function lookupPapeisEPermissoes(
  prisma: PrismaService,
  usuarioId: string,
  empresaId: string,
) {
  const client = await prisma.pgPool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.empresa_id', $1, true)", [empresaId]);

    const result = await client.query<{ papelNome: string; chave: string }>(
      `SELECT p.nome AS "papelNome", perm.chave
       FROM usuario_papeis up
       JOIN papeis p ON p.id = up."papelId"
       JOIN papel_permissoes pp ON pp."papelId" = p.id
       JOIN permissoes perm ON perm.id = pp."permissaoId"
       WHERE up."usuarioId" = $1::uuid`,
      [usuarioId],
    );

    await client.query('COMMIT');

    const permissoes = new Set<string>();
    const papeis = new Set<string>();
    for (const row of result.rows) {
      papeis.add(row.papelNome);
      permissoes.add(row.chave);
    }
    return { papeis: Array.from(papeis), permissoes };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
