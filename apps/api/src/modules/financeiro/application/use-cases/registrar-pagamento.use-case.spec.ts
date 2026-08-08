import {
  ContaJaQuitadaError,
  ContaPagarNaoEncontradaError,
  ValorLancamentoInvalidoError,
} from '../../domain/financeiro.errors';
import { RegistrarPagamentoUseCase } from './registrar-pagamento.use-case';
import {
  TENANT_FIXTURE,
  contaParaLancamentoFixture,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
} from './test-helpers';

describe('RegistrarPagamentoUseCase', () => {
  it('registra um pagamento parcial e calcula o novo status', async () => {
    const repo = createMockRepo();
    repo.obterContaPagarComLock.mockResolvedValue(contaParaLancamentoFixture());
    const useCase = new RegistrarPagamentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await useCase.execute(TENANT_FIXTURE, 'conta-pagar-1', { valor: 40 });

    expect(repo.registrarPagamento).toHaveBeenCalledWith(
      expect.objectContaining({ contaPagarId: 'conta-pagar-1', novoStatus: 'PARCIAL' }),
      TENANT_FIXTURE.usuarioId,
    );
  });

  it('rejeita conta inexistente', async () => {
    const repo = createMockRepo();
    repo.obterContaPagarComLock.mockResolvedValue(null);
    const useCase = new RegistrarPagamentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'conta-pagar-1', { valor: 10 }),
    ).rejects.toBeInstanceOf(ContaPagarNaoEncontradaError);
  });

  it('rejeita registrar pagamento numa conta cancelada', async () => {
    const repo = createMockRepo();
    repo.obterContaPagarComLock.mockResolvedValue(
      contaParaLancamentoFixture({ status: 'CANCELADO' }),
    );
    const useCase = new RegistrarPagamentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'conta-pagar-1', { valor: 10 }),
    ).rejects.toBeInstanceOf(ContaJaQuitadaError);
  });

  it('rejeita valor maior que o saldo em aberto', async () => {
    const repo = createMockRepo();
    repo.obterContaPagarComLock.mockResolvedValue(contaParaLancamentoFixture());
    const useCase = new RegistrarPagamentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'conta-pagar-1', { valor: 999 }),
    ).rejects.toBeInstanceOf(ValorLancamentoInvalidoError);
  });
});
