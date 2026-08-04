const dotenvPath = 'c:\\Users\\caina\\OneDrive\\Documentos\\lumen\\LUMEN-ERP\\.env';
require('dotenv').config({ path: dotenvPath });
const { Pool } = require('pg');

const AUTH_USER_ID = process.env.SEED_ADMIN_AUTH_USER_ID;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', (err) => console.error('POOL ERROR', err.message));

async function attempt(client, label, withSync) {
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.auth_user_id', $1, true)", [AUTH_USER_ID]);
    if (withSync) await client.query("SELECT current_setting('app.auth_user_id', true)");

    let usuario;
    try {
      const r = await client.query(
        `SELECT id, "empresaId" FROM usuarios WHERE "authUserId" = $1::uuid AND ativo = true LIMIT 1`,
        [AUTH_USER_ID],
      );
      usuario = r.rows[0];
    } catch (e) {
      console.log(`${label}: FAIL na query usuarios - ${e.message}`);
      await client.query('ROLLBACK').catch(() => undefined);
      return;
    }

    if (!usuario) {
      console.log(`${label}: usuario nao encontrado`);
      await client.query('COMMIT');
      return;
    }

    await client.query("SELECT set_config('app.empresa_id', $1, true)", [usuario.empresaId]);
    if (withSync) await client.query("SELECT current_setting('app.empresa_id', true)");

    try {
      const perm = await client.query(
        `SELECT perm.chave FROM usuario_papeis up JOIN papeis p ON p.id = up."papelId" JOIN papel_permissoes pp ON pp."papelId" = p.id JOIN permissoes perm ON perm.id = pp."permissaoId" WHERE up."usuarioId" = $1::uuid`,
        [usuario.id],
      );
      await client.query('COMMIT');
      console.log(`${label}: OK, ${perm.rows.length} permissoes`);
    } catch (e) {
      console.log(`${label}: FAIL na query permissoes - ${e.message}`);
      await client.query('ROLLBACK').catch(() => undefined);
    }
  } catch (e) {
    console.log(`${label}: FAIL geral - ${e.message}`);
    await client.query('ROLLBACK').catch(() => undefined);
  }
}

async function main() {
  console.log('=== SEM sync extra, mesma conexao, 6x ===');
  let c = await pool.connect();
  for (let i = 0; i < 6; i++) await attempt(c, `  noSync#${i}`, false);
  c.release();

  console.log('=== COM sync extra (current_setting apos cada set_config), mesma conexao, 6x ===');
  c = await pool.connect();
  for (let i = 0; i < 6; i++) await attempt(c, `  sync#${i}`, true);
  c.release();

  console.log('=== COM sync extra, conexoes novas do pool, 6x ===');
  for (let i = 0; i < 6; i++) {
    c = await pool.connect();
    await attempt(c, `  syncNewConn#${i}`, true);
    c.release();
  }

  await pool.end();
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
