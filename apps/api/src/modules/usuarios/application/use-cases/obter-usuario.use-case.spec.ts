import { UsuarioNaoEncontradoError } from '../../domain/usuario.errors';
import { ObterUsuarioUseCase } from './obter-usuario.use-case';
import { TENANT_FIXTURE, createFakeTxRunner, createMockRepo, usuarioFixture } from './test-helpers';

describe('ObterUsuarioUseCase', () => {
  it('retorna o usuário quando encontrado', async () => {
    const repo = createMockRepo();
    const usuario = usuarioFixture();
    repo.obterPorId.mockResolvedValue(usuario);
    const useCase = new ObterUsuarioUseCase(createFakeTxRunner(), () => repo);

    await expect(useCase.execute(TENANT_FIXTURE, usuario.id)).resolves.toBe(usuario);
  });

  it('lança UsuarioNaoEncontradoError quando não existe', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(null);
    const useCase = new ObterUsuarioUseCase(createFakeTxRunner(), () => repo);

    await expect(useCase.execute(TENANT_FIXTURE, 'inexistente')).rejects.toBeInstanceOf(
      UsuarioNaoEncontradoError,
    );
  });
});
