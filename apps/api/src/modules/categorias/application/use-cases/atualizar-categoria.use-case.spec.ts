import {
  HierarquiaExcedeUmNivelError,
  NomeCategoriaJaCadastradoError,
} from '../../domain/categoria.errors';
import { AtualizarCategoriaUseCase } from './atualizar-categoria.use-case';
import {
  TENANT_FIXTURE,
  categoriaFixture,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
} from './test-helpers';

describe('AtualizarCategoriaUseCase', () => {
  it('atualiza normalmente quando nada de hierarquia muda', async () => {
    const repo = createMockRepo();
    const antes = categoriaFixture({ nome: 'Antigo' });
    const depois = categoriaFixture({ nome: 'Novo' });
    repo.obterPorId.mockResolvedValue(antes);
    repo.existeNome.mockResolvedValue(false);
    repo.atualizar.mockResolvedValue(depois);
    const useCase = new AtualizarCategoriaUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, antes.id, { nome: 'Novo' })).resolves.toBe(depois);
    expect(repo.temSubcategorias).not.toHaveBeenCalled();
  });

  it('rejeita transformar em subcategoria uma categoria que já tem subcategorias', async () => {
    const repo = createMockRepo();
    const antes = categoriaFixture({ id: 'cat-1', categoriaPaiId: null });
    repo.obterPorId.mockImplementation(async (id) =>
      id === 'cat-1' ? antes : categoriaFixture({ id: 'cat-2', categoriaPaiId: null }),
    );
    repo.temSubcategorias.mockResolvedValue(true);
    const useCase = new AtualizarCategoriaUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'cat-1', { categoriaPaiId: 'cat-2' }),
    ).rejects.toBeInstanceOf(HierarquiaExcedeUmNivelError);
    expect(repo.atualizar).not.toHaveBeenCalled();
  });

  it('rejeita nome duplicado', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(categoriaFixture({ nome: 'Antigo' }));
    repo.existeNome.mockResolvedValue(true);
    const useCase = new AtualizarCategoriaUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'categoria-1', { nome: 'Novo' }),
    ).rejects.toBeInstanceOf(NomeCategoriaJaCadastradoError);
  });
});
