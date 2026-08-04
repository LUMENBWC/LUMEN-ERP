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
 * belong to and which permissions they hold. Runs as `app_api` inside a
 * single transaction, in two steps because RLS gates each step differently
 * (see migration 20260803224008_usuarios_self_lookup and ADR-0002):
 *
 * 1. Set `app.auth_user_id` and look up `usuarios` via the self_lookup
 *    policy - `app.empresa_id` isn't known yet at this point.
 * 2. Now that `empresaId` is known, set `app.empresa_id` and read the
 *    user's papeis/permissoes through the normal tenant_isolation policy.
 *
 * Issues these queries directly against the underlying `pg` pool
 * (`prisma.$queryRaw`/model queries) rather than through Prisma: repeated
 * calls to the same Prisma query inside `prisma.$transaction()` were
 * observed to intermittently receive an empty string in place of the
 * `set_config`-assigned session variable after the first call, on an
 * otherwise-idle long-running NestJS process (not reproducible in a
 * standalone script making the same calls). Root cause not confirmed
 * upstream (Prisma 7 driver-adapter query compilation is very new); talking
 * to `pg` directly sidesteps it entirely.
 */
export async function resolveTenantContext(
  prisma: PrismaService,
  authUserId: string,
): Promise<TenantContext | null> {
  const pool = prisma.pgPool;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.auth_user_id', $1, true)", [authUserId]);

    const usuarioResult = await client.query<{
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
    const usuario = usuarioResult.rows[0];

    if (!usuario) {
      await client.query('COMMIT');
      return null;
    }

    await client.query("SELECT set_config('app.empresa_id', $1, true)", [usuario.empresaId]);

    const permissaoResult = await client.query<{ papelNome: string; chave: string }>(
      `SELECT p.nome AS "papelNome", perm.chave
       FROM usuario_papeis up
       JOIN papeis p ON p.id = up."papelId"
       JOIN papel_permissoes pp ON pp."papelId" = p.id
       JOIN permissoes perm ON perm.id = pp."permissaoId"
       WHERE up."usuarioId" = $1::uuid`,
      [usuario.id],
    );

    await client.query('COMMIT');

    const permissoes = new Set<string>();
    const papeis = new Set<string>();
    for (const row of permissaoResult.rows) {
      papeis.add(row.papelNome);
      permissoes.add(row.chave);
    }

    return {
      authUserId,
      usuarioId: usuario.id,
      empresaId: usuario.empresaId,
      filialId: usuario.filialId,
      nome: usuario.nome,
      email: usuario.email,
      papeis: Array.from(papeis),
      permissoes,
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
