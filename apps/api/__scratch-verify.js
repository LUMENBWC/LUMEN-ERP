const dotenvPath = 'c:\\Users\\caina\\OneDrive\\Documentos\\lumen\\LUMEN-ERP\\.env';
require('dotenv').config({ path: dotenvPath });
const { Pool } = require('pg');

const AUTH_USER_ID = process.env.SEED_ADMIN_AUTH_USER_ID;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', (err) => console.error('POOL ERROR', err.message));

async function tx(c, fn) {
  await c.query('BEGIN');
  try {
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) {
    await c.query('ROLLBACK').catch(() => undefined);
    throw e;
  }
}

async function runN(label, n, fn) {
  let ok = 0, fail = 0;
  const errs = [];
  for (let i = 0; i < n; i++) {
    const c = await pool.connect();
    try {
      await fn(c);
      ok++;
    } catch (e) {
      fail++;
      if (errs.length < 3) errs.push(e.message);
    } finally {
      c.release();
    }
  }
  console.log(`${label}: ok=${ok} fail=${fail}${errs.length ? '  ex: ' + errs.join(' | ') : ''}`);
}

async function main() {
  // F: duas transacoes SEPARADAS, cada uma com exatamente 1 set_config
  await runN('F: 2 transacoes separadas, 1 GUC cada', 40, async (c) => {
    const usuario = await tx(c, async () => {
      await c.query("SELECT set_config('app.auth_user_id', $1, true)", [AUTH_USER_ID]);
      const r = await c.query(`SELECT id, "empresaId" FROM usuarios WHERE "authUserId" = $1::uuid AND ativo = true LIMIT 1`, [AUTH_USER_ID]);
      return r.rows[0];
    });
    await tx(c, async () => {
      await c.query("SELECT set_config('app.empresa_id', $1, true)", [usuario.empresaId]);
      await c.query(`SELECT 1 FROM usuario_papeis WHERE "usuarioId" = $1::uuid LIMIT 1`, [usuario.id]);
    });
  });

  // G: fluxo completo real (como sera o codigo de producao) usando 1 unica chamada combinada de set_config no inicio da 2a etapa junto com a query de permissoes via CTE
  await runN('G: combinado - set_config auth + query usuarios (1 stmt), depois set_config empresa + query perms (1 stmt via CTE)', 40, async (c) => {
    await c.query('BEGIN');
    try {
      await c.query("SELECT set_config('app.auth_user_id', $1, true)", [AUTH_USER_ID]);
      const r = await c.query(`SELECT id, "empresaId" FROM usuarios WHERE "authUserId" = $1::uuid AND ativo = true LIMIT 1`, [AUTH_USER_ID]);
      const usuario = r.rows[0];
      const perm = await c.query(
        `WITH _ctx AS (SELECT set_config('app.empresa_id', $1, true))
         SELECT perm.chave FROM usuario_papeis up JOIN papeis p ON p.id = up."papelId" JOIN papel_permissoes pp ON pp."papelId" = p.id JOIN permissoes perm ON perm.id = pp."permissaoId", _ctx
         WHERE up."usuarioId" = $2::uuid`,
        [usuario.empresaId, usuario.id],
      );
      await c.query('COMMIT');
    } catch (e) {
      await c.query('ROLLBACK').catch(() => undefined);
      throw e;
    }
  });

  await pool.end();
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
