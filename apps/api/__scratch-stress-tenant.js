const dotenvPath = 'c:\\Users\\caina\\OneDrive\\Documentos\\lumen\\LUMEN-ERP\\.env';
require('dotenv').config({ path: dotenvPath });
const { Pool } = require('pg');

const AUTH_USER_ID = process.env.SEED_ADMIN_AUTH_USER_ID;
if (!AUTH_USER_ID) { console.error('missing SEED_ADMIN_AUTH_USER_ID'); process.exit(1); }
console.log('DATABASE_URL host:', new URL(process.env.DATABASE_URL).host);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', (err) => console.error('POOL ERROR', err.message));

async function resolveTenantContext(authUserId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.auth_user_id', $1, true)", [authUserId]);
    const usuarioResult = await client.query(
      `SELECT id, "empresaId", "filialId", nome, email FROM usuarios WHERE "authUserId" = $1::uuid AND ativo = true LIMIT 1`,
      [authUserId],
    );
    const usuario = usuarioResult.rows[0];
    if (!usuario) { await client.query('COMMIT'); return null; }
    await client.query("SELECT set_config('app.empresa_id', $1, true)", [usuario.empresaId]);
    const permissaoResult = await client.query(
      `SELECT p.nome AS "papelNome", perm.chave FROM usuario_papeis up JOIN papeis p ON p.id = up."papelId" JOIN papel_permissoes pp ON pp."papelId" = p.id JOIN permissoes perm ON perm.id = pp."permissaoId" WHERE up."usuarioId" = $1::uuid`,
      [usuario.id],
    );
    await client.query('COMMIT');
    return { usuario, permCount: permissaoResult.rows.length };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  let ok = 0, fail = 0;
  console.log('--- Fase 1: sequencial rapido (100x) ---');
  for (let i = 0; i < 100; i++) {
    try {
      const r = await resolveTenantContext(AUTH_USER_ID);
      if (!r) throw new Error('usuario nao encontrado');
      ok++;
    } catch (e) {
      fail++;
      console.error(`  falha #${i}:`, e.message);
    }
  }
  console.log(`Fase 1: ok=${ok} fail=${fail}`);

  console.log('--- Fase 2: concorrente (10 lotes de 20 paralelas) ---');
  ok = 0; fail = 0;
  for (let batch = 0; batch < 10; batch++) {
    const results = await Promise.allSettled(
      Array.from({ length: 20 }, () => resolveTenantContext(AUTH_USER_ID)),
    );
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) ok++;
      else { fail++; console.error('  falha concorrente:', r.status === 'rejected' ? r.reason.message : 'null result'); }
    }
  }
  console.log(`Fase 2: ok=${ok} fail=${fail}`);

  console.log('--- Fase 3: com pausas (10x, 3s entre cada, simula think-time humano) ---');
  ok = 0; fail = 0;
  for (let i = 0; i < 10; i++) {
    await sleep(3000);
    try {
      const r = await resolveTenantContext(AUTH_USER_ID);
      if (!r) throw new Error('usuario nao encontrado');
      ok++;
    } catch (e) {
      fail++;
      console.error(`  falha pausada #${i}:`, e.message);
    }
  }
  console.log(`Fase 3: ok=${ok} fail=${fail}`);

  await pool.end();
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
