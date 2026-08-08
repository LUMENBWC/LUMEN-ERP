import {
  CategoriaDespesaNaoEncontradaError,
  FornecedorInvalidoError,
} from '../../domain/financeiro.errors';
import { CriarContaPagarUseCase } from './criar-conta-pagar.use-case';
import {
  TENANT_FIXTURE,
  contaPagarDetalhadaFixture,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
} from './test-helpers';

function baseDto() {
  return {
    fornecedorId: null,
    categoriaDespesaId: null,
    descricao: 'Aluguel',
    valorTotal: 500,
    vencimento: new Date('2026-02-01T00:00:00.000Z'),
  };
}

describe('CriarContaPagarUseCase', () => {
  it('cria uma conta a pagar sem fornecedor nem categoria', async () => {
    const repo = createMockRepo();
    repo.criarContaPagar.mockResolvedValue(contaPagarDetalhadaFixture());
    const useCase = new CriarContaPagarUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    const resultado = await useCase.execute(TENANT_FIXTURE, baseDto());

    expect(resultado.id).toBe('conta-pagar-1');
    expect(repo.fornecedorExiste).not.toHaveBeenCalled();
  });

  it('rejeita fornecedor inexistente', async () => {
    const repo = createMockRepo();
    repo.fornecedorExiste.mockResolvedValue(false);
    const useCase = new CriarContaPagarUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, { ...baseDto(), fornecedorId: 'fornecedor-1' }),
    ).rejects.toBeInstanceOf(FornecedorInvalidoError);
    expect(repo.criarContaPagar).not.toHaveBeenCalled();
  });

  it('rejeita categoria de despesa inexistente', async () => {
    const repo = createMockRepo();
    repo.categoriaDespesaExiste.mockResolvedValue(false);
    const useCase = new CriarContaPagarUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, { ...baseDto(), categoriaDespesaId: 'categoria-1' }),
    ).rejects.toBeInstanceOf(CategoriaDespesaNaoEncontradaError);
    expect(repo.criarContaPagar).not.toHaveBeenCalled();
  });
});
