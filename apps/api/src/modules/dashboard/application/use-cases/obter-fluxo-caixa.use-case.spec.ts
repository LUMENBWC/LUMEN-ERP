import { Prisma } from '../../../../../generated/prisma/client';
import { ObterFluxoCaixaUseCase } from './obter-fluxo-caixa.use-case';
import { TENANT_FIXTURE, createFakeTxRunner, createMockRepo } from './test-helpers';

describe('ObterFluxoCaixaUseCase', () => {
  it('calcula o saldo do período a partir das entradas e saídas', async () => {
    const repo = createMockRepo();
    repo.obterEntradasESaidasCaixa.mockResolvedValue({
      entradas: new Prisma.Decimal(500),
      saidas: new Prisma.Decimal(120),
    });
    const useCase = new ObterFluxoCaixaUseCase(createFakeTxRunner(), () => repo);

    const resultado = await useCase.execute(TENANT_FIXTURE, {
      dataInicio: undefined,
      dataFim: undefined,
    });

    expect(resultado.entradas.toNumber()).toBe(500);
    expect(resultado.saidas.toNumber()).toBe(120);
    expect(resultado.saldo.toNumber()).toBe(380);
  });
});
