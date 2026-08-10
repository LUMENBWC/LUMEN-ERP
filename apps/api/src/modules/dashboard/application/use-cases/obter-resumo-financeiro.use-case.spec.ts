import { Prisma } from '../../../../../generated/prisma/client';
import { ObterResumoFinanceiroUseCase } from './obter-resumo-financeiro.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockRepo,
  faturamentoECustoFixture,
  totalEAgingFixture,
} from './test-helpers';

describe('ObterResumoFinanceiroUseCase', () => {
  it('monta o resumo financeiro calculando o lucro a partir do faturamento, custo e despesas', async () => {
    const repo = createMockRepo();
    repo.obterFaturamentoECusto.mockResolvedValue(faturamentoECustoFixture());
    repo.obterDespesasPagas.mockResolvedValue(new Prisma.Decimal(100));
    repo.obterTotalEAgingReceber.mockResolvedValue(totalEAgingFixture());
    repo.obterTotalEAgingPagar.mockResolvedValue(
      totalEAgingFixture({ total: new Prisma.Decimal(150) }),
    );
    const useCase = new ObterResumoFinanceiroUseCase(createFakeTxRunner(), () => repo);

    const resultado = await useCase.execute(TENANT_FIXTURE, {
      dataInicio: undefined,
      dataFim: undefined,
    });

    expect(resultado.faturamento.toNumber()).toBe(1000);
    expect(resultado.custoProdutosVendidos.toNumber()).toBe(400);
    expect(resultado.despesasPagas.toNumber()).toBe(100);
    expect(resultado.lucro.toNumber()).toBe(500);
    expect(resultado.totalAReceber.toNumber()).toBe(300);
    expect(resultado.totalAPagar.toNumber()).toBe(150);
    expect(resultado.periodo.fim).toBeInstanceOf(Date);
  });
});
