import {
  OrcamentoNaoCancelavelError,
  OrcamentoNaoEncontradoError,
} from '../../domain/orcamento.errors';
import { CancelarOrcamentoUseCase } from './cancelar-orcamento.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
  orcamentoFixture,
} from './test-helpers';

describe('CancelarOrcamentoUseCase', () => {
  it('cancela um orçamento em rascunho', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(orcamentoFixture({ status: 'RASCUNHO' }));
    const useCase = new CancelarOrcamentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await useCase.execute(TENANT_FIXTURE, 'orcamento-1');

    expect(repo.cancelar).toHaveBeenCalledWith('orcamento-1', TENANT_FIXTURE.usuarioId);
  });

  it('cancela um orçamento enviado', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(orcamentoFixture({ status: 'ENVIADO' }));
    const useCase = new CancelarOrcamentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await useCase.execute(TENANT_FIXTURE, 'orcamento-1');

    expect(repo.cancelar).toHaveBeenCalled();
  });

  it('rejeita orçamento inexistente', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(null);
    const useCase = new CancelarOrcamentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, 'orcamento-1')).rejects.toBeInstanceOf(
      OrcamentoNaoEncontradoError,
    );
  });

  it('rejeita cancelar um orçamento já aprovado', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(orcamentoFixture({ status: 'APROVADO' }));
    const useCase = new CancelarOrcamentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, 'orcamento-1')).rejects.toBeInstanceOf(
      OrcamentoNaoCancelavelError,
    );
    expect(repo.cancelar).not.toHaveBeenCalled();
  });
});
