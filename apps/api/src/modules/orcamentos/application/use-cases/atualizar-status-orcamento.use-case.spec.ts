import {
  OrcamentoNaoEncontradoError,
  TransicaoStatusInvalidaError,
} from '../../domain/orcamento.errors';
import { AtualizarStatusOrcamentoUseCase } from './atualizar-status-orcamento.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
  orcamentoFixture,
} from './test-helpers';

describe('AtualizarStatusOrcamentoUseCase', () => {
  it('aplica uma transição válida', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(orcamentoFixture({ status: 'RASCUNHO' }));
    repo.atualizarStatus.mockResolvedValue(orcamentoFixture({ status: 'ENVIADO' }));
    const auditLog = createMockAuditLog();
    const useCase = new AtualizarStatusOrcamentoUseCase(createFakeTxRunner(), () => repo, auditLog);

    const resultado = await useCase.execute(TENANT_FIXTURE, 'orcamento-1', { status: 'ENVIADO' });

    expect(resultado.status).toBe('ENVIADO');
    expect(repo.atualizarStatus).toHaveBeenCalledWith(
      'orcamento-1',
      'ENVIADO',
      TENANT_FIXTURE.usuarioId,
    );
  });

  it('rejeita orçamento inexistente', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(null);
    const useCase = new AtualizarStatusOrcamentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'orcamento-1', { status: 'ENVIADO' }),
    ).rejects.toBeInstanceOf(OrcamentoNaoEncontradoError);
  });

  it('rejeita transição inválida', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(orcamentoFixture({ status: 'RASCUNHO' }));
    const useCase = new AtualizarStatusOrcamentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'orcamento-1', { status: 'APROVADO' }),
    ).rejects.toBeInstanceOf(TransicaoStatusInvalidaError);
    expect(repo.atualizarStatus).not.toHaveBeenCalled();
  });
});
