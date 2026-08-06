import {
  FornecedorNaoEncontradoError,
  ProdutoInvalidoError,
  ProdutoJaVinculadoError,
} from '../../domain/fornecedor.errors';
import { VincularProdutoUseCase } from './vincular-produto.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
  fornecedorFixture,
} from './test-helpers';

describe('VincularProdutoUseCase', () => {
  it('vincula o produto ao fornecedor', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(fornecedorFixture());
    repo.produtoExiste.mockResolvedValue(true);
    repo.vinculoExiste.mockResolvedValue(false);
    const auditLog = createMockAuditLog();
    const useCase = new VincularProdutoUseCase(createFakeTxRunner(), () => repo, auditLog);

    await useCase.execute(TENANT_FIXTURE, 'fornecedor-1', 'produto-1');

    expect(repo.vincularProduto).toHaveBeenCalledWith('fornecedor-1', 'produto-1');
    expect(auditLog.record).toHaveBeenCalledWith(
      undefined,
      TENANT_FIXTURE.empresaId,
      expect.objectContaining({ acao: 'VINCULAR_PRODUTO' }),
    );
  });

  it('rejeita fornecedor inexistente', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(null);
    repo.produtoExiste.mockResolvedValue(true);
    const useCase = new VincularProdutoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'fornecedor-1', 'produto-1'),
    ).rejects.toBeInstanceOf(FornecedorNaoEncontradoError);
    expect(repo.vincularProduto).not.toHaveBeenCalled();
  });

  it('rejeita produto inexistente', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(fornecedorFixture());
    repo.produtoExiste.mockResolvedValue(false);
    const useCase = new VincularProdutoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'fornecedor-1', 'produto-1'),
    ).rejects.toBeInstanceOf(ProdutoInvalidoError);
  });

  it('rejeita vínculo duplicado', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(fornecedorFixture());
    repo.produtoExiste.mockResolvedValue(true);
    repo.vinculoExiste.mockResolvedValue(true);
    const useCase = new VincularProdutoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'fornecedor-1', 'produto-1'),
    ).rejects.toBeInstanceOf(ProdutoJaVinculadoError);
    expect(repo.vincularProduto).not.toHaveBeenCalled();
  });
});
