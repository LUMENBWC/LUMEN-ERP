import {
  DocumentoInvalidoError,
  DocumentoJaCadastradoError,
  FornecedorNaoEncontradoError,
} from '../../domain/fornecedor.errors';
import { AtualizarFornecedorUseCase } from './atualizar-fornecedor.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
  fornecedorFixture,
} from './test-helpers';

describe('AtualizarFornecedorUseCase', () => {
  it('atualiza campos sem tocar no documento sem revalidar', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(fornecedorFixture());
    const atualizado = fornecedorFixture({ nome: 'Novo Nome' });
    repo.atualizar.mockResolvedValue(atualizado);
    const useCase = new AtualizarFornecedorUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    const resultado = await useCase.execute(TENANT_FIXTURE, 'fornecedor-1', {
      nome: 'Novo Nome',
    });

    expect(resultado).toBe(atualizado);
    expect(repo.existeDocumento).not.toHaveBeenCalled();
  });

  it('rejeita fornecedor inexistente', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(null);
    const useCase = new AtualizarFornecedorUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'fornecedor-1', { nome: 'X' }),
    ).rejects.toBeInstanceOf(FornecedorNaoEncontradoError);
  });

  it('rejeita documento inválido ao trocar de tipoPessoa mantendo o documento antigo', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(
      fornecedorFixture({ tipoPessoa: 'JURIDICA', documento: '11222333000181' }),
    );
    const useCase = new AtualizarFornecedorUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'fornecedor-1', { tipoPessoa: 'FISICA' }),
    ).rejects.toBeInstanceOf(DocumentoInvalidoError);
  });

  it('rejeita documento já usado por outro fornecedor', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(fornecedorFixture());
    repo.existeDocumento.mockResolvedValue(true);
    const useCase = new AtualizarFornecedorUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'fornecedor-1', { documento: '11.222.333/0001-81' }),
    ).rejects.toBeInstanceOf(DocumentoJaCadastradoError);
  });
});
