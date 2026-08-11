import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { API_PREFIX, createTestApp } from './support/bootstrap-app';
import {
  createSupabaseAdminClient,
  createSupabasePublishableClient,
  hasSupabaseAdminCredentials,
} from './support/supabase-admin';

// Precisa de SUPABASE_URL + SUPABASE_SECRET_KEY reais (ver .env) - sem eles
// não há como emitir um JWT genuíno para testar a fronteira de autenticação.
const describeComCredenciais = hasSupabaseAdminCredentials() ? describe : describe.skip;

describeComCredenciais('Autenticação (e2e - JWT real do Supabase)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let authUserId: string | undefined;
  const email = `e2e-auth-${randomUUID()}@lumen-erp-test.local`;
  const senha = randomUUID();

  beforeAll(async () => {
    app = await createTestApp();

    const admin = createSupabaseAdminClient();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    });
    if (createError || !created.user) {
      throw new Error(`Falha ao criar usuário de teste no Supabase Auth: ${createError?.message}`);
    }
    authUserId = created.user.id;

    const publishable = createSupabasePublishableClient();
    const { data: sessionData, error: signInError } = await publishable.auth.signInWithPassword({
      email,
      password: senha,
    });
    if (signInError || !sessionData.session) {
      throw new Error(`Falha ao autenticar usuário de teste: ${signInError?.message}`);
    }
    accessToken = sessionData.session.access_token;
  });

  afterAll(async () => {
    if (authUserId) {
      const admin = createSupabaseAdminClient();
      await admin.auth.admin.deleteUser(authUserId).catch(() => undefined);
    }
    await app.close();
  });

  it('rejeita requisição sem token', async () => {
    await request(app.getHttpServer()).get(`/${API_PREFIX}/me`).expect(401);
  });

  it('rejeita requisição com token malformado', async () => {
    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/me`)
      .set('Authorization', 'Bearer token-invalido-e-mal-formado')
      .expect(401);
  });

  it('permite rota pública sem token', async () => {
    await request(app.getHttpServer()).get(`/${API_PREFIX}/health`).expect(200);
  });

  it('valida a assinatura de um JWT real do Supabase, mas rejeita usuário sem cadastro na empresa (403)', async () => {
    // O usuário existe no Supabase Auth (JWT genuíno, assinatura válida) mas
    // nunca foi cadastrado como `Usuario` de nenhuma empresa - prova que a
    // verificação de JWT em si funciona de ponta a ponta contra o JWKS real,
    // distinto de token ausente/inválido (401 acima).
    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/me`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });
});
