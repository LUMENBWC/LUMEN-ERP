import { ProdutoNaoEncontradoError } from '../../domain/produto.errors';
import { DefinirAtivoProdutoUseCase } from './definir-ativo-produto.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
  produtoFixture,
} from './test-helpers';

describe('DefinirAtivoProdutoUseCase', () => {
  it('desativa o produto e grava auditoria', async () => {
    const repo = createMockRepo();
    const antes = produtoFixture({ ativo: true });
    repo.obterPorId.mockResolvedValue(antes);
    repo.definirAtivo.mockResolvedValue({ ...antes, ativo: false });
    const auditLog = createMockAuditLog();
    const useCase = new DefinirAtivoProdutoUseCase(createFakeTxRunner(), () => repo, auditLog);

    const resultado = await useCase.execute(TENANT_FIXTURE, antes.id, false);

    expect(resultado.ativo).toBe(false);
    expect(auditLog.record).toHaveBeenCalledWith(
      undefined,
      TENANT_FIXTURE.empresaId,
      expect.objectContaining({ acao: 'DESATIVAR' }),
    );
  });

  it('rejeita quando o produto não existe', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(null);
    const useCase = new DefinirAtivoProdutoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, 'inexistente', false)).rejects.toBeInstanceOf(
      ProdutoNaoEncontradoError,
    );
  });
});
