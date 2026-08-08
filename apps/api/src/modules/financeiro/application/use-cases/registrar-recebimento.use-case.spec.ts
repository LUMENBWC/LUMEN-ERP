import { Prisma } from '../../../../../generated/prisma/client';
import {
  ContaJaQuitadaError,
  ContaReceberNaoEncontradaError,
  ValorLancamentoInvalidoError,
} from '../../domain/financeiro.errors';
import { RegistrarRecebimentoUseCase } from './registrar-recebimento.use-case';
import {
  TENANT_FIXTURE,
  contaParaLancamentoFixture,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
} from './test-helpers';

describe('RegistrarRecebimentoUseCase', () => {
  it('registra um recebimento parcial e calcula o novo status', async () => {
    const repo = createMockRepo();
    repo.obterContaReceberComLock.mockResolvedValue(contaParaLancamentoFixture());
    const useCase = new RegistrarRecebimentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await useCase.execute(TENANT_FIXTURE, 'conta-1', { valor: 40, formaPagamento: 'PIX' });

    expect(repo.registrarRecebimento).toHaveBeenCalledWith(
      expect.objectContaining({
        contaReceberId: 'conta-1',
        novoStatus: 'PARCIAL',
        formaPagamento: 'PIX',
      }),
      TENANT_FIXTURE.usuarioId,
    );
  });

  it('quita a conta quando o recebimento cobre o saldo restante', async () => {
    const repo = createMockRepo();
    repo.obterContaReceberComLock.mockResolvedValue(
      contaParaLancamentoFixture({ valorAcumulado: new Prisma.Decimal(60) }),
    );
    const useCase = new RegistrarRecebimentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await useCase.execute(TENANT_FIXTURE, 'conta-1', { valor: 40, formaPagamento: 'PIX' });

    expect(repo.registrarRecebimento).toHaveBeenCalledWith(
      expect.objectContaining({ novoStatus: 'PAGO' }),
      TENANT_FIXTURE.usuarioId,
    );
  });

  it('rejeita conta inexistente', async () => {
    const repo = createMockRepo();
    repo.obterContaReceberComLock.mockResolvedValue(null);
    const useCase = new RegistrarRecebimentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'conta-1', { valor: 10, formaPagamento: 'PIX' }),
    ).rejects.toBeInstanceOf(ContaReceberNaoEncontradaError);
  });

  it('rejeita registrar recebimento numa conta já paga', async () => {
    const repo = createMockRepo();
    repo.obterContaReceberComLock.mockResolvedValue(contaParaLancamentoFixture({ status: 'PAGO' }));
    const useCase = new RegistrarRecebimentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'conta-1', { valor: 10, formaPagamento: 'PIX' }),
    ).rejects.toBeInstanceOf(ContaJaQuitadaError);
  });

  it('rejeita valor maior que o saldo em aberto', async () => {
    const repo = createMockRepo();
    repo.obterContaReceberComLock.mockResolvedValue(contaParaLancamentoFixture());
    const useCase = new RegistrarRecebimentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'conta-1', { valor: 999, formaPagamento: 'PIX' }),
    ).rejects.toBeInstanceOf(ValorLancamentoInvalidoError);
    expect(repo.registrarRecebimento).not.toHaveBeenCalled();
  });
});
