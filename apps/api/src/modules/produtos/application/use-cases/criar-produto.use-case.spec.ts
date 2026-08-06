import {
  CategoriaInvalidaError,
  CodigoBarrasJaCadastradoError,
  SkuJaCadastradoError,
} from '../../domain/produto.errors';
import type { CriarProdutoDto } from '../dto/criar-produto.dto';
import { CriarProdutoUseCase } from './criar-produto.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
  produtoFixture,
} from './test-helpers';

const dto: CriarProdutoDto = {
  nome: 'Coca-Cola 2L',
  descricao: null,
  sku: 'SKU-001',
  codigoBarras: '7891000000001',
  unidadeMedida: 'UN',
  categoriaId: null,
  precoCusto: 5,
  precoVenda: 8,
  estoqueMinimo: 10,
  ncm: null,
  cfop: null,
  cst: null,
};

describe('CriarProdutoUseCase', () => {
  it('cria o produto com a margem de lucro calculada automaticamente', async () => {
    const repo = createMockRepo();
    repo.existeSku.mockResolvedValue(false);
    repo.existeCodigoBarras.mockResolvedValue(false);
    const criado = produtoFixture();
    repo.criar.mockResolvedValue(criado);
    const auditLog = createMockAuditLog();
    const useCase = new CriarProdutoUseCase(createFakeTxRunner(), () => repo, auditLog);

    const resultado = await useCase.execute(TENANT_FIXTURE, dto);

    expect(resultado).toBe(criado);
    const inputPassado = repo.criar.mock.calls[0][0];
    expect(inputPassado.margemLucro.toString()).toBe('0.375');
    expect(auditLog.record).toHaveBeenCalledWith(
      undefined,
      TENANT_FIXTURE.empresaId,
      expect.objectContaining({ acao: 'CRIAR' }),
    );
  });

  it('rejeita SKU duplicado', async () => {
    const repo = createMockRepo();
    repo.existeSku.mockResolvedValue(true);
    repo.existeCodigoBarras.mockResolvedValue(false);
    const useCase = new CriarProdutoUseCase(createFakeTxRunner(), () => repo, createMockAuditLog());

    await expect(useCase.execute(TENANT_FIXTURE, dto)).rejects.toBeInstanceOf(SkuJaCadastradoError);
    expect(repo.criar).not.toHaveBeenCalled();
  });

  it('rejeita código de barras duplicado', async () => {
    const repo = createMockRepo();
    repo.existeSku.mockResolvedValue(false);
    repo.existeCodigoBarras.mockResolvedValue(true);
    const useCase = new CriarProdutoUseCase(createFakeTxRunner(), () => repo, createMockAuditLog());

    await expect(useCase.execute(TENANT_FIXTURE, dto)).rejects.toBeInstanceOf(
      CodigoBarrasJaCadastradoError,
    );
  });

  it('rejeita categoria inexistente', async () => {
    const repo = createMockRepo();
    repo.existeSku.mockResolvedValue(false);
    repo.existeCodigoBarras.mockResolvedValue(false);
    repo.categoriaExiste.mockResolvedValue(false);
    const useCase = new CriarProdutoUseCase(createFakeTxRunner(), () => repo, createMockAuditLog());

    await expect(
      useCase.execute(TENANT_FIXTURE, { ...dto, categoriaId: 'inexistente' }),
    ).rejects.toBeInstanceOf(CategoriaInvalidaError);
  });

  it('não checa código de barras quando ele não foi informado', async () => {
    const repo = createMockRepo();
    repo.existeSku.mockResolvedValue(false);
    repo.criar.mockResolvedValue(produtoFixture());
    const useCase = new CriarProdutoUseCase(createFakeTxRunner(), () => repo, createMockAuditLog());

    await useCase.execute(TENANT_FIXTURE, { ...dto, codigoBarras: null });

    expect(repo.existeCodigoBarras).not.toHaveBeenCalled();
  });
});
