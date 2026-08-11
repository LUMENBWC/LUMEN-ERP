import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { API_PREFIX, createTestApp } from './support/bootstrap-app';
import { limparAuthUsersDeTeste, seedTenantAdministrador } from './support/seed-tenant';
import { gerarCpfValido } from './support/gerar-cpf-valido';
import { hasSupabaseAdminCredentials } from './support/supabase-admin';
import { TEST_AUTH_HEADER } from '../src/common/auth/supabase-auth.guard';

const describeComCredenciais = hasSupabaseAdminCredentials() ? describe : describe.skip;

describeComCredenciais('Conversão de orçamento em venda (e2e)', () => {
  let app: INestApplication<App>;
  let authUserId: string;

  beforeAll(async () => {
    app = await createTestApp();
    const tenant = await seedTenantAdministrador('33333333000191', 'LUMEN ERP E2E - Orçamentos');
    authUserId = tenant.authUserId;
  });

  afterAll(async () => {
    await app.close();
    await limparAuthUsersDeTeste();
  });

  function auth(test: request.Test): request.Test {
    return test.set(TEST_AUTH_HEADER, authUserId);
  }

  async function criarProdutoComEstoque(sufixo: string) {
    const produto = await auth(request(app.getHttpServer()).post(`/${API_PREFIX}/produtos`))
      .send({
        nome: `Produto Orçamento E2E ${sufixo}`,
        sku: `SKU-ORC-${sufixo}`,
        unidadeMedida: 'UN',
        precoCusto: 5,
        precoVenda: 20,
        estoqueMinimo: 0,
      })
      .expect(201);

    await auth(request(app.getHttpServer()).post(`/${API_PREFIX}/estoque/entradas`))
      .send({ produtoId: produto.body.id, quantidade: 50, custoUnitario: 5 })
      .expect(201);

    return produto.body.id as string;
  }

  async function criarCliente(sufixo: string) {
    const cliente = await auth(request(app.getHttpServer()).post(`/${API_PREFIX}/clientes`))
      .send({ nome: `Cliente E2E ${sufixo}`, documento: gerarCpfValido() })
      .expect(201);
    return cliente.body.id as string;
  }

  async function criarOrcamentoAprovado(sufixo: string) {
    const produtoId = await criarProdutoComEstoque(sufixo);
    const clienteId = await criarCliente(sufixo);

    const orcamento = await auth(request(app.getHttpServer()).post(`/${API_PREFIX}/orcamentos`))
      .send({
        clienteId,
        itens: [{ produtoId, quantidade: 2, precoUnitario: 20, desconto: 0 }],
      })
      .expect(201);

    await auth(
      request(app.getHttpServer()).patch(`/${API_PREFIX}/orcamentos/${orcamento.body.id}/status`),
    )
      .send({ status: 'ENVIADO' })
      .expect(200);

    await auth(
      request(app.getHttpServer()).patch(`/${API_PREFIX}/orcamentos/${orcamento.body.id}/status`),
    )
      .send({ status: 'APROVADO' })
      .expect(200);

    return { orcamentoId: orcamento.body.id as string, clienteId, produtoId };
  }

  it('converte um orçamento aprovado em venda, reaproveitando os itens e baixando estoque', async () => {
    const sufixo = randomUUID().slice(0, 8);
    const { orcamentoId, clienteId, produtoId } = await criarOrcamentoAprovado(sufixo);

    const venda = await auth(request(app.getHttpServer()).post(`/${API_PREFIX}/vendas`))
      .send({
        orcamentoId,
        pagamentos: [{ formaPagamento: 'PIX', valor: 40, parcelas: 1, bandeira: null }],
      })
      .expect(201);

    expect(Number(venda.body.total)).toBe(40);
    expect(venda.body.clienteId).toBe(clienteId);

    const orcamentoAtualizado = await auth(
      request(app.getHttpServer()).get(`/${API_PREFIX}/orcamentos/${orcamentoId}`),
    ).expect(200);
    expect(orcamentoAtualizado.body.status).toBe('CONVERTIDO');

    const produtoAtualizado = await auth(
      request(app.getHttpServer()).get(`/${API_PREFIX}/produtos/${produtoId}`),
    ).expect(200);
    expect(Number(produtoAtualizado.body.estoqueAtual)).toBe(48);
  });

  it('rejeita converter um orçamento que ainda não foi aprovado', async () => {
    const sufixo = randomUUID().slice(0, 8);
    const produtoId = await criarProdutoComEstoque(sufixo);
    const clienteId = await criarCliente(sufixo);

    const orcamento = await auth(request(app.getHttpServer()).post(`/${API_PREFIX}/orcamentos`))
      .send({ clienteId, itens: [{ produtoId, quantidade: 1, precoUnitario: 20, desconto: 0 }] })
      .expect(201);

    await auth(request(app.getHttpServer()).post(`/${API_PREFIX}/vendas`))
      .send({
        orcamentoId: orcamento.body.id,
        pagamentos: [{ formaPagamento: 'PIX', valor: 20, parcelas: 1, bandeira: null }],
      })
      .expect(409);
  });

  it('rejeita converter o mesmo orçamento duas vezes', async () => {
    const sufixo = randomUUID().slice(0, 8);
    const { orcamentoId } = await criarOrcamentoAprovado(sufixo);

    await auth(request(app.getHttpServer()).post(`/${API_PREFIX}/vendas`))
      .send({
        orcamentoId,
        pagamentos: [{ formaPagamento: 'PIX', valor: 40, parcelas: 1, bandeira: null }],
      })
      .expect(201);

    await auth(request(app.getHttpServer()).post(`/${API_PREFIX}/vendas`))
      .send({
        orcamentoId,
        pagamentos: [{ formaPagamento: 'PIX', valor: 40, parcelas: 1, bandeira: null }],
      })
      .expect(409);
  });
});
