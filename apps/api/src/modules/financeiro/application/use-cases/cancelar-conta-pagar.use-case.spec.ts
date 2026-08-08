import { Prisma } from '../../../../../generated/prisma/client';
import {
  ContaPagarNaoCancelavelError,
  ContaPagarNaoEncontradaError,
} from '../../domain/financeiro.errors';
import { CancelarContaPagarUseCase } from './cancelar-conta-pagar.use-case';
import {
  TENANT_FIXTURE,
  contaParaLancamentoFixture,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
} from './test-helpers';

describe('CancelarContaPagarUseCase', () => {
  it('cancela uma conta a pagar sem pagamentos', async () => {
    const repo = createMockRepo();
    repo.obterContaPagarComLock.mockResolvedValue(contaParaLancamentoFixture());
    const useCase = new CancelarContaPagarUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await useCase.execute(TENANT_FIXTURE, 'conta-pagar-1');

    expect(repo.cancelarContaPagar).toHaveBeenCalledWith('conta-pagar-1', TENANT_FIXTURE.usuarioId);
  });

  it('rejeita conta inexistente', async () => {
    const repo = createMockRepo();
    repo.obterContaPagarComLock.mockResolvedValue(null);
    const useCase = new CancelarContaPagarUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, 'conta-pagar-1')).rejects.toBeInstanceOf(
      ContaPagarNaoEncontradaError,
    );
  });

  it('rejeita cancelar uma conta que já recebeu algum pagamento', async () => {
    const repo = createMockRepo();
    repo.obterContaPagarComLock.mockResolvedValue(
      contaParaLancamentoFixture({ valorAcumulado: new Prisma.Decimal(50) }),
    );
    const useCase = new CancelarContaPagarUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, 'conta-pagar-1')).rejects.toBeInstanceOf(
      ContaPagarNaoCancelavelError,
    );
    expect(repo.cancelarContaPagar).not.toHaveBeenCalled();
  });
});
