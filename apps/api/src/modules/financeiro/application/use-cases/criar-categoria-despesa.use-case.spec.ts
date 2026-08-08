import { CategoriaDespesaDuplicadaError } from '../../domain/financeiro.errors';
import { CriarCategoriaDespesaUseCase } from './criar-categoria-despesa.use-case';
import {
  TENANT_FIXTURE,
  categoriaDespesaFixture,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
} from './test-helpers';

describe('CriarCategoriaDespesaUseCase', () => {
  it('cria uma categoria de despesa', async () => {
    const repo = createMockRepo();
    repo.categoriaDespesaExistePorNome.mockResolvedValue(false);
    repo.criarCategoriaDespesa.mockResolvedValue(categoriaDespesaFixture());
    const useCase = new CriarCategoriaDespesaUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    const resultado = await useCase.execute(TENANT_FIXTURE, { nome: 'Aluguel' });

    expect(resultado.nome).toBe('Aluguel');
  });

  it('rejeita nome duplicado', async () => {
    const repo = createMockRepo();
    repo.categoriaDespesaExistePorNome.mockResolvedValue(true);
    const useCase = new CriarCategoriaDespesaUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, { nome: 'Aluguel' })).rejects.toBeInstanceOf(
      CategoriaDespesaDuplicadaError,
    );
    expect(repo.criarCategoriaDespesa).not.toHaveBeenCalled();
  });
});
