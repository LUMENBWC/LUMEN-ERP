import {
  OrcamentoNaoEditavelError,
  OrcamentoNaoEncontradoError,
} from '../../domain/orcamento.errors';
import type { CriarOrcamentoDto } from '../dto/criar-orcamento.dto';
import { AtualizarOrcamentoUseCase } from './atualizar-orcamento.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
  orcamentoFixture,
} from './test-helpers';

const dto: CriarOrcamentoDto = {
  clienteId: 'cliente-1',
  itens: [{ produtoId: 'produto-1', quantidade: 5, precoUnitario: 20, desconto: 0 }],
  descontoGeral: 0,
  validade: null,
  observacoes: null,
};

describe('AtualizarOrcamentoUseCase', () => {
  it('atualiza um orçamento em rascunho', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(orcamentoFixture({ status: 'RASCUNHO' }));
    repo.clienteExiste.mockResolvedValue(true);
    repo.produtosExistentes.mockResolvedValue(new Set(['produto-1']));
    const atualizado = orcamentoFixture();
    repo.atualizar.mockResolvedValue(atualizado);
    const useCase = new AtualizarOrcamentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    const resultado = await useCase.execute(TENANT_FIXTURE, 'orcamento-1', dto);

    expect(resultado).toBe(atualizado);
  });

  it('rejeita orçamento inexistente', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(null);
    const useCase = new AtualizarOrcamentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, 'orcamento-1', dto)).rejects.toBeInstanceOf(
      OrcamentoNaoEncontradoError,
    );
  });

  it('rejeita edição de orçamento que não está mais em rascunho', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(orcamentoFixture({ status: 'ENVIADO' }));
    const useCase = new AtualizarOrcamentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, 'orcamento-1', dto)).rejects.toBeInstanceOf(
      OrcamentoNaoEditavelError,
    );
    expect(repo.atualizar).not.toHaveBeenCalled();
  });
});
