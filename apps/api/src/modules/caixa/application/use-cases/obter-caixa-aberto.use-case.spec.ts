import { ObterCaixaAbertoUseCase } from './obter-caixa-aberto.use-case';
import {
  TENANT_FIXTURE,
  caixaSessaoFixture,
  createFakeTxRunner,
  createMockRepo,
} from './test-helpers';

describe('ObterCaixaAbertoUseCase', () => {
  it('retorna a sessão aberta da empresa, se existir', async () => {
    const repo = createMockRepo();
    repo.sessaoAbertaDaEmpresa.mockResolvedValue(caixaSessaoFixture());
    const useCase = new ObterCaixaAbertoUseCase(createFakeTxRunner(), () => repo);

    const resultado = await useCase.execute(TENANT_FIXTURE);

    expect(resultado?.id).toBe('caixa-sessao-1');
  });

  it('retorna null quando não há sessão aberta', async () => {
    const repo = createMockRepo();
    repo.sessaoAbertaDaEmpresa.mockResolvedValue(null);
    const useCase = new ObterCaixaAbertoUseCase(createFakeTxRunner(), () => repo);

    const resultado = await useCase.execute(TENANT_FIXTURE);

    expect(resultado).toBeNull();
  });
});
