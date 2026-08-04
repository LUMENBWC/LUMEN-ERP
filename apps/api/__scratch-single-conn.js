const dotenvPath = 'c:\\Users\\caina\\OneDrive\\Documentos\\lumen\\LUMEN-ERP\\.env';
require('dotenv').config({ path: dotenvPath });
const { Pool } = require('pg');

const AUTH_USER_ID = process.env.SEED_ADMIN_AUTH_USER_ID;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', (err) => console.error('POOL ERROR', err.message));

// Hypothesis: 1 local set_config per transaction is always safe, even on
// already-contaminated backends; 2 in the same transaction is what poisons
// the backend. Test by splitting empresaId lookup into its OWN transaction.
async function twoTx(c, label) {
  let usuario;
  await c.query('BEGIN');
  try {
    await c.query("SELECT set_config('app.auth_user_id', $1, true)", [AUTH_USER_ID]);
    const r = await c.query(
      `SELECT id, "empresaId" FROM usuarios WHERE "authUserId" = $1::uuid AND ativo = true LIMIT 1`,
      [AUTH_USER_ID],
    );
    usuario = r.rows[0];
    await c.query('COMMIT');
  } catch (e) {
    await c.query('ROLLBACK').catch(() => undefined);
    console.log(`${label}: FAIL tx1 (usuarios) - ${e.message}`);
    return;
  }
  if (!usuario) {
    console.log(`${label}: usuario nao encontrado`);
    return;
  }
  await c.query('BEGIN');
  try {
    await c.query("SELECT set_config('app.empresa_id', $1, true)", [usuario.empresaId]);
    const perm = await c.query(
      `SELECT perm.chave FROM usuario_papeis up JOIN papeis p ON p.id = up."papelId" JOIN papel_permissoes pp ON pp."papelId" = p.id JOIN permissoes perm ON perm.id = pp."permissaoId" WHERE up."usuarioId" = $1::uuid`,
      [usuario.id],
    );
    await c.query('COMMIT');
    console.log(`${label}: OK duas transacoes (perms=${perm.rows.length})`);
  } catch (e) {
    await c.query('ROLLBACK').catch(() => undefined);
    console.log(`${label}: FAIL tx2 (permissoes) - ${e.message}`);
  }
}

async function main() {
  console.log('=== Duas transacoes separadas (1 GUC cada), mesma conexao, 15x ===');
  let c = await pool.connect();
  for (let i = 0; i < 15; i++) await twoTx(c, `  r#${i}`);
  c.release();

  console.log('=== Duas transacoes separadas, conexoes novas do pool, 15x ===');
  for (let i = 0; i < 15; i++) {
    c = await pool.connect();
    await twoTx(c, `  new#${i}`);
    c.release();
  }

  await pool.end();
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
