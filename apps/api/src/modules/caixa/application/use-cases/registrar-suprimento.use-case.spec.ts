import { CaixaNaoAbertoError } from '../../domain/caixa.errors';
import { RegistrarSuprimentoUseCase } from './registrar-suprimento.use-case';
import {
  TENANT_FIXTURE,
  caixaSessaoFixture,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
} from './test-helpers';

describe('RegistrarSuprimentoUseCase', () => {
  it('registra um suprimento na sessão aberta', async () => {
    const repo = createMockRepo();
    repo.sessaoAbertaDaEmpresa.mockResolvedValue(caixaSessaoFixture());
    const useCase = new RegistrarSuprimentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await useCase.execute(TENANT_FIXTURE, { valor: 50, motivo: 'Troco adicional' });

    expect(repo.registrarMovimento).toHaveBeenCalledWith(
      expect.objectContaining({
        caixaSessaoId: 'caixa-sessao-1',
        tipo: 'SUPRIMENTO',
        descricao: 'Troco adicional',
      }),
      TENANT_FIXTURE.usuarioId,
    );
  });

  it('rejeita quando não há caixa aberto', async () => {
    const repo = createMockRepo();
    repo.sessaoAbertaDaEmpresa.mockResolvedValue(null);
    const useCase = new RegistrarSuprimentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, { valor: 50, motivo: null }),
    ).rejects.toBeInstanceOf(CaixaNaoAbertoError);
  });
});
