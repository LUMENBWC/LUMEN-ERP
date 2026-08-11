import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { API_PREFIX, createTestApp } from './support/bootstrap-app';
import {
  limparAuthUsersDeTeste,
  seedTenantAdministrador,
  seedUsuarioSemPermissoes,
} from './support/seed-tenant';
import { hasSupabaseAdminCredentials } from './support/supabase-admin';
import { TEST_AUTH_HEADER } from '../src/common/auth/supabase-auth.guard';

const describeComCredenciais = hasSupabaseAdminCredentials() ? describe : describe.skip;

describeComCredenciais('Isolamento multi-tenant e RBAC (e2e)', () => {
  let app: INestApplication<App>;
  let authUserIdA: string;
  let authUserIdB: string;
  let empresaIdA: string;

  beforeAll(async () => {
    app = await createTestApp();
    const tenantA = await seedTenantAdministrador('44444444000191', 'LUMEN ERP E2E - Tenant A');
    const tenantB = await seedTenantAdministrador('55555555000191', 'LUMEN ERP E2E - Tenant B');
    authUserIdA = tenantA.authUserId;
    authUserIdB = tenantB.authUserId;
    empresaIdA = tenantA.empresaId;
  });

  afterAll(async () => {
    await app.close();
    await limparAuthUsersDeTeste();
  });

  function comoA(test: request.Test): request.Test {
    return test.set(TEST_AUTH_HEADER, authUserIdA);
  }
  function comoB(test: request.Test): request.Test {
    return test.set(TEST_AUTH_HEADER, authUserIdB);
  }

  it('um produto criado pelo tenant A é invisível para o tenant B, mesmo pedindo o id diretamente', async () => {
    const sufixo = randomUUID().slice(0, 8);
    const produto = await comoA(request(app.getHttpServer()).post(`/${API_PREFIX}/produtos`))
      .send({
        nome: `Produto Isolamento E2E ${sufixo}`,
        sku: `SKU-ISO-${sufixo}`,
        unidadeMedida: 'UN',
        precoCusto: 5,
        precoVenda: 10,
        estoqueMinimo: 0,
      })
      .expect(201);

    await comoA(
      request(app.getHttpServer()).get(`/${API_PREFIX}/produtos/${produto.body.id}`),
    ).expect(200);

    await comoB(
      request(app.getHttpServer()).get(`/${API_PREFIX}/produtos/${produto.body.id}`),
    ).expect(404);

    const listaDoB = await comoB(
      request(app.getHttpServer()).get(`/${API_PREFIX}/produtos?page=1&perPage=100`),
    ).expect(200);
    const idsDoB = (listaDoB.body.items as { id: string }[]).map((p) => p.id);
    expect(idsDoB).not.toContain(produto.body.id);
  });

  it('uma venda no tenant B não pode referenciar um produto do tenant A (RLS gate no lock por id+empresaId)', async () => {
    const sufixo = randomUUID().slice(0, 8);
    const produtoDeA = await comoA(request(app.getHttpServer()).post(`/${API_PREFIX}/produtos`))
      .send({
        nome: `Produto Só de A E2E ${sufixo}`,
        sku: `SKU-SOA-${sufixo}`,
        unidadeMedida: 'UN',
        precoCusto: 5,
        precoVenda: 10,
        estoqueMinimo: 0,
      })
      .expect(201);

    await comoB(request(app.getHttpServer()).post(`/${API_PREFIX}/vendas`))
      .send({
        itens: [{ produtoId: produtoDeA.body.id, quantidade: 1, precoUnitario: 10, desconto: 0 }],
        pagamentos: [{ formaPagamento: 'PIX', valor: 10, parcelas: 1, bandeira: null }],
      })
      .expect(404);
  });

  it('um usuário sem nenhuma permissão é bloqueado pelo PermissionsGuard (403)', async () => {
    const semPermissoes = await seedUsuarioSemPermissoes(empresaIdA);

    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/produtos`)
      .set(TEST_AUTH_HEADER, semPermissoes.authUserId)
      .expect(403);
  });
});
