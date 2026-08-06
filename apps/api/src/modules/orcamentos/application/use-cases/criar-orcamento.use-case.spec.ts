import { ClienteInvalidoError, ProdutoInvalidoError } from '../../domain/orcamento.errors';
import type { CriarOrcamentoDto } from '../dto/criar-orcamento.dto';
import { CriarOrcamentoUseCase } from './criar-orcamento.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
  orcamentoFixture,
} from './test-helpers';

const dto: CriarOrcamentoDto = {
  clienteId: 'cliente-1',
  itens: [{ produtoId: 'produto-1', quantidade: 10, precoUnitario: 10, desconto: 0 }],
  descontoGeral: 0,
  validade: null,
  observacoes: null,
};

describe('CriarOrcamentoUseCase', () => {
  it('calcula os totais e cria o orçamento', async () => {
    const repo = createMockRepo();
    repo.clienteExiste.mockResolvedValue(true);
    repo.produtosExistentes.mockResolvedValue(new Set(['produto-1']));
    const criado = orcamentoFixture();
    repo.criar.mockResolvedValue(criado);
    const auditLog = createMockAuditLog();
    const useCase = new CriarOrcamentoUseCase(createFakeTxRunner(), () => repo, auditLog);

    const resultado = await useCase.execute(TENANT_FIXTURE, dto);

    expect(resultado).toBe(criado);
    const inputPassado = repo.criar.mock.calls[0][0];
    expect(inputPassado.subtotal.toString()).toBe('100');
    expect(inputPassado.total.toString()).toBe('100');
    expect(auditLog.record).toHaveBeenCalledWith(
      undefined,
      TENANT_FIXTURE.empresaId,
      expect.objectContaining({ acao: 'CRIAR' }),
    );
  });

  it('rejeita cliente inexistente', async () => {
    const repo = createMockRepo();
    repo.clienteExiste.mockResolvedValue(false);
    repo.produtosExistentes.mockResolvedValue(new Set(['produto-1']));
    const useCase = new CriarOrcamentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, dto)).rejects.toBeInstanceOf(ClienteInvalidoError);
    expect(repo.criar).not.toHaveBeenCalled();
  });

  it('rejeita produto inexistente em algum item', async () => {
    const repo = createMockRepo();
    repo.clienteExiste.mockResolvedValue(true);
    repo.produtosExistentes.mockResolvedValue(new Set());
    const useCase = new CriarOrcamentoUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, dto)).rejects.toBeInstanceOf(ProdutoInvalidoError);
    expect(repo.criar).not.toHaveBeenCalled();
  });
});
