import { Prisma } from '../../../../../generated/prisma/client';
import { ProdutoNaoEncontradoError, SkuJaCadastradoError } from '../../domain/produto.errors';
import { AtualizarProdutoUseCase } from './atualizar-produto.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
  produtoFixture,
} from './test-helpers';

describe('AtualizarProdutoUseCase', () => {
  it('recalcula a margem quando só o preço de venda muda (usa o custo já salvo)', async () => {
    const repo = createMockRepo();
    const antes = produtoFixture({
      precoCusto: new Prisma.Decimal(5),
      precoVenda: new Prisma.Decimal(8),
    });
    repo.obterPorId.mockResolvedValue(antes);
    repo.atualizar.mockResolvedValue(produtoFixture({ precoVenda: new Prisma.Decimal(10) }));
    const useCase = new AtualizarProdutoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await useCase.execute(TENANT_FIXTURE, antes.id, { precoVenda: 10 });

    const inputPassado = repo.atualizar.mock.calls[0][1];
    expect(inputPassado.precoCusto?.toString()).toBe('5');
    expect(inputPassado.precoVenda?.toString()).toBe('10');
    expect(inputPassado.margemLucro?.toString()).toBe('0.5');
  });

  it('não mexe em preço/margem quando não fazem parte do update', async () => {
    const repo = createMockRepo();
    const antes = produtoFixture();
    repo.obterPorId.mockResolvedValue(antes);
    repo.atualizar.mockResolvedValue(antes);
    const useCase = new AtualizarProdutoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await useCase.execute(TENANT_FIXTURE, antes.id, { nome: 'Novo nome' });

    const inputPassado = repo.atualizar.mock.calls[0][1];
    expect(inputPassado.precoCusto).toBeUndefined();
    expect(inputPassado.margemLucro).toBeUndefined();
  });

  it('rejeita SKU duplicado', async () => {
    const repo = createMockRepo();
    const antes = produtoFixture({ sku: 'SKU-001' });
    repo.obterPorId.mockResolvedValue(antes);
    repo.existeSku.mockResolvedValue(true);
    const useCase = new AtualizarProdutoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, antes.id, { sku: 'SKU-002' }),
    ).rejects.toBeInstanceOf(SkuJaCadastradoError);
  });

  it('rejeita quando o produto não existe', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(null);
    const useCase = new AtualizarProdutoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'inexistente', { nome: 'X' }),
    ).rejects.toBeInstanceOf(ProdutoNaoEncontradoError);
  });
});
