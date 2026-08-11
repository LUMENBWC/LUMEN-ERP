import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { API_PREFIX, createTestApp } from './support/bootstrap-app';
import {
  fecharCaixasAbertosDoTenant,
  limparAuthUsersDeTeste,
  seedTenantAdministrador,
} from './support/seed-tenant';
import { hasSupabaseAdminCredentials } from './support/supabase-admin';
import { TEST_AUTH_HEADER } from '../src/common/auth/supabase-auth.guard';

// Provisionar um tenant de teste exige criar um usuário real no Supabase
// Auth (FK `usuarios_authUserId_fkey`) - sem SUPABASE_SECRET_KEY não dá.
const describeComCredenciais = hasSupabaseAdminCredentials() ? describe : describe.skip;

describeComCredenciais('Venda completa no PDV (e2e)', () => {
  let app: INestApplication<App>;
  let authUserId: string;

  beforeAll(async () => {
    app = await createTestApp();
    const tenant = await seedTenantAdministrador('11111111000191', 'LUMEN ERP E2E - PDV');
    authUserId = tenant.authUserId;
    await fecharCaixasAbertosDoTenant(tenant.empresaId);
  });

  afterAll(async () => {
    await app.close();
    await limparAuthUsersDeTeste();
  });

  function auth(test: request.Test): request.Test {
    return test.set(TEST_AUTH_HEADER, authUserId);
  }

  it('finaliza uma venda em dinheiro: baixa estoque, quita a conta a receber e registra movimento de caixa', async () => {
    const sufixo = randomUUID().slice(0, 8);

    const categoria = await auth(request(app.getHttpServer()).post(`/${API_PREFIX}/categorias`))
      .send({ nome: `Categoria E2E ${sufixo}` })
      .expect(201);

    const produto = await auth(request(app.getHttpServer()).post(`/${API_PREFIX}/produtos`))
      .send({
        nome: `Produto E2E ${sufixo}`,
        sku: `SKU-${sufixo}`,
        unidadeMedida: 'UN',
        categoriaId: categoria.body.id,
        precoCusto: 5,
        precoVenda: 10,
        estoqueMinimo: 0,
      })
      .expect(201);

    await auth(request(app.getHttpServer()).post(`/${API_PREFIX}/estoque/entradas`))
      .send({ produtoId: produto.body.id, quantidade: 50, custoUnitario: 5 })
      .expect(201);

    const caixa = await auth(request(app.getHttpServer()).post(`/${API_PREFIX}/caixa/abrir`))
      .send({ valorAbertura: 100 })
      .expect(201);

    const venda = await auth(request(app.getHttpServer()).post(`/${API_PREFIX}/vendas`))
      .send({
        itens: [{ produtoId: produto.body.id, quantidade: 3, precoUnitario: 10, desconto: 0 }],
        pagamentos: [{ formaPagamento: 'DINHEIRO', valor: 30, parcelas: 1, bandeira: null }],
      })
      .expect(201);

    expect(Number(venda.body.total)).toBe(30);
    expect(venda.body.status).toBe('CONCLUIDA');

    const produtoAtualizado = await auth(
      request(app.getHttpServer()).get(`/${API_PREFIX}/produtos/${produto.body.id}`),
    ).expect(200);
    expect(Number(produtoAtualizado.body.estoqueAtual)).toBe(47);

    const sessao = await auth(
      request(app.getHttpServer()).get(`/${API_PREFIX}/caixa/sessoes/${caixa.body.id}`),
    ).expect(200);
    const movimentoVenda = (
      sessao.body.movimentos as { origemId: string | null; tipo: string; valor: string }[]
    ).find((m) => m.origemId === venda.body.id);
    expect(movimentoVenda).toBeDefined();
    expect(movimentoVenda?.tipo).toBe('VENDA');
    expect(Number(movimentoVenda?.valor)).toBe(30);

    const contasReceber = await auth(
      request(app.getHttpServer()).get(
        `/${API_PREFIX}/financeiro/contas-receber?page=1&perPage=50`,
      ),
    ).expect(200);
    const contaDaVenda = (
      contasReceber.body.items as { vendaId: string | null; status: string; valorTotal: string }[]
    ).find((c) => c.vendaId === venda.body.id);
    expect(contaDaVenda).toBeDefined();
    expect(contaDaVenda?.status).toBe('PAGO');
    expect(Number(contaDaVenda?.valorTotal)).toBe(30);
  });

  it('rejeita venda com quantidade maior que o estoque disponível', async () => {
    const sufixo = randomUUID().slice(0, 8);

    const produto = await auth(request(app.getHttpServer()).post(`/${API_PREFIX}/produtos`))
      .send({
        nome: `Produto Sem Estoque E2E ${sufixo}`,
        sku: `SKU-${sufixo}`,
        unidadeMedida: 'UN',
        precoCusto: 5,
        precoVenda: 10,
        estoqueMinimo: 0,
      })
      .expect(201);

    await auth(request(app.getHttpServer()).post(`/${API_PREFIX}/vendas`))
      .send({
        itens: [{ produtoId: produto.body.id, quantidade: 1, precoUnitario: 10, desconto: 0 }],
        pagamentos: [{ formaPagamento: 'PIX', valor: 10, parcelas: 1, bandeira: null }],
      })
      .expect(409);
  });

  it('rejeita rota sem o header de autenticação de teste (401)', async () => {
    await request(app.getHttpServer()).get(`/${API_PREFIX}/vendas?page=1&perPage=10`).expect(401);
  });
});
