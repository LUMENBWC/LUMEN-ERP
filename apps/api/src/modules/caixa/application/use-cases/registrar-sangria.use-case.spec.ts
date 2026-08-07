import { CaixaNaoAbertoError, SaldoCaixaInsuficienteError } from '../../domain/caixa.errors';
import { RegistrarSangriaUseCase } from './registrar-sangria.use-case';
import {
  TENANT_FIXTURE,
  caixaSessaoFixture,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
  movimentoCaixaFixture,
} from './test-helpers';

describe('RegistrarSangriaUseCase', () => {
  it('registra uma sangria quando há saldo suficiente', async () => {
    const repo = createMockRepo();
    repo.sessaoAbertaDaEmpresa.mockResolvedValue(caixaSessaoFixture());
    repo.listarMovimentos.mockResolvedValue([movimentoCaixaFixture({ tipo: 'ABERTURA' })]);
    const useCase = new RegistrarSangriaUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await useCase.execute(TENANT_FIXTURE, { valor: 50, motivo: 'Depósito no banco' });

    expect(repo.registrarMovimento).toHaveBeenCalledWith(
      expect.objectContaining({
        caixaSessaoId: 'caixa-sessao-1',
        tipo: 'SANGRIA',
        descricao: 'Depósito no banco',
      }),
      TENANT_FIXTURE.usuarioId,
    );
  });

  it('rejeita quando não há caixa aberto', async () => {
    const repo = createMockRepo();
    repo.sessaoAbertaDaEmpresa.mockResolvedValue(null);
    const useCase = new RegistrarSangriaUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, { valor: 50, motivo: 'Depósito' }),
    ).rejects.toBeInstanceOf(CaixaNaoAbertoError);
  });

  it('rejeita sangria maior que o saldo disponível', async () => {
    const repo = createMockRepo();
    repo.sessaoAbertaDaEmpresa.mockResolvedValue(caixaSessaoFixture());
    repo.listarMovimentos.mockResolvedValue([movimentoCaixaFixture({ tipo: 'ABERTURA' })]);
    const useCase = new RegistrarSangriaUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, { valor: 999, motivo: 'Depósito' }),
    ).rejects.toBeInstanceOf(SaldoCaixaInsuficienteError);
    expect(repo.registrarMovimento).not.toHaveBeenCalled();
  });
});
