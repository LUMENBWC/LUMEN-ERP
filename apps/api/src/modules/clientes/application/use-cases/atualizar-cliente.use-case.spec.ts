import {
  ClienteNaoEncontradoError,
  DocumentoInvalidoError,
  DocumentoJaCadastradoError,
} from '../../domain/cliente.errors';
import { AtualizarClienteUseCase } from './atualizar-cliente.use-case';
import {
  TENANT_FIXTURE,
  clienteFixture,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
} from './test-helpers';

describe('AtualizarClienteUseCase', () => {
  it('atualiza campos sem tocar no documento sem revalidar', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(clienteFixture());
    const atualizado = clienteFixture({ nome: 'João S.' });
    repo.atualizar.mockResolvedValue(atualizado);
    const useCase = new AtualizarClienteUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    const resultado = await useCase.execute(TENANT_FIXTURE, 'cliente-1', { nome: 'João S.' });

    expect(resultado).toBe(atualizado);
    expect(repo.existeDocumento).not.toHaveBeenCalled();
  });

  it('revalida o documento quando ele muda, usando o tipoPessoa atual', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(clienteFixture({ tipoPessoa: 'FISICA' }));
    repo.existeDocumento.mockResolvedValue(false);
    repo.atualizar.mockResolvedValue(clienteFixture({ documento: '11222333000181' }));
    const useCase = new AtualizarClienteUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    // documento de outra pessoa fisica valido (mesmo algoritmo do CPF de teste)
    await useCase.execute(TENANT_FIXTURE, 'cliente-1', { documento: '529.982.247-25' });

    expect(repo.existeDocumento).toHaveBeenCalledWith('529.982.247-25', 'cliente-1');
    expect(repo.atualizar).toHaveBeenCalled();
  });

  it('rejeita documento inválido ao trocar de tipoPessoa mantendo o documento antigo', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(
      clienteFixture({ tipoPessoa: 'FISICA', documento: '11144477735' }),
    );
    const useCase = new AtualizarClienteUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'cliente-1', { tipoPessoa: 'JURIDICA' }),
    ).rejects.toBeInstanceOf(DocumentoInvalidoError);
  });

  it('rejeita cliente inexistente', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(null);
    const useCase = new AtualizarClienteUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'cliente-1', { nome: 'X' }),
    ).rejects.toBeInstanceOf(ClienteNaoEncontradoError);
  });

  it('rejeita documento já usado por outro cliente', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(clienteFixture());
    repo.existeDocumento.mockResolvedValue(true);
    const useCase = new AtualizarClienteUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'cliente-1', { documento: '111.444.777-35' }),
    ).rejects.toBeInstanceOf(DocumentoJaCadastradoError);
  });
});
