import { CaixaJaAbertoError } from '../../domain/caixa.errors';
import { AbrirCaixaUseCase } from './abrir-caixa.use-case';
import {
  TENANT_FIXTURE,
  caixaSessaoFixture,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
} from './test-helpers';

describe('AbrirCaixaUseCase', () => {
  it('abre uma sessão de caixa e registra o movimento de abertura', async () => {
    const repo = createMockRepo();
    repo.sessaoAbertaDaEmpresa.mockResolvedValue(null);
    repo.abrir.mockResolvedValue(caixaSessaoFixture());
    const useCase = new AbrirCaixaUseCase(createFakeTxRunner(), () => repo, createMockAuditLog());

    const resultado = await useCase.execute(TENANT_FIXTURE, { valorAbertura: 100 });

    expect(resultado.id).toBe('caixa-sessao-1');
    expect(repo.abrir).toHaveBeenCalledWith(
      { valorAbertura: expect.objectContaining({ toString: expect.any(Function) }) },
      TENANT_FIXTURE.usuarioId,
    );
    expect(repo.registrarMovimento).toHaveBeenCalledWith(
      expect.objectContaining({ caixaSessaoId: 'caixa-sessao-1', tipo: 'ABERTURA' }),
      TENANT_FIXTURE.usuarioId,
    );
  });

  it('rejeita abrir um segundo caixa enquanto já existe um aberto', async () => {
    const repo = createMockRepo();
    repo.sessaoAbertaDaEmpresa.mockResolvedValue(caixaSessaoFixture());
    const useCase = new AbrirCaixaUseCase(createFakeTxRunner(), () => repo, createMockAuditLog());

    await expect(useCase.execute(TENANT_FIXTURE, { valorAbertura: 100 })).rejects.toBeInstanceOf(
      CaixaJaAbertoError,
    );
    expect(repo.abrir).not.toHaveBeenCalled();
  });
});
