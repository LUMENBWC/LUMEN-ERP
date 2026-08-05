import { EmailJaCadastradoError, UsuarioNaoEncontradoError } from '../../domain/usuario.errors';
import { AtualizarUsuarioUseCase } from './atualizar-usuario.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
  usuarioFixture,
} from './test-helpers';

describe('AtualizarUsuarioUseCase', () => {
  it('atualiza e grava auditoria com antes/depois', async () => {
    const repo = createMockRepo();
    const antes = usuarioFixture({ nome: 'Nome Antigo' });
    const depois = usuarioFixture({ nome: 'Nome Novo' });
    repo.obterPorId.mockResolvedValue(antes);
    repo.atualizar.mockResolvedValue(depois);
    const auditLog = createMockAuditLog();
    const useCase = new AtualizarUsuarioUseCase(createFakeTxRunner(), () => repo, auditLog);

    const resultado = await useCase.execute(TENANT_FIXTURE, antes.id, { nome: 'Nome Novo' });

    expect(resultado).toBe(depois);
    expect(auditLog.record).toHaveBeenCalledWith(
      undefined,
      TENANT_FIXTURE.empresaId,
      expect.objectContaining({ acao: 'ATUALIZAR', dadosAntes: antes, dadosDepois: depois }),
    );
  });

  it('não checa e-mail duplicado quando o e-mail não mudou', async () => {
    const repo = createMockRepo();
    const usuario = usuarioFixture({ email: 'mesmo@example.com' });
    repo.obterPorId.mockResolvedValue(usuario);
    repo.atualizar.mockResolvedValue(usuario);
    const useCase = new AtualizarUsuarioUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await useCase.execute(TENANT_FIXTURE, usuario.id, { email: 'mesmo@example.com' });

    expect(repo.existeEmail).not.toHaveBeenCalled();
  });

  it('rejeita quando o novo e-mail já está em uso por outro usuário', async () => {
    const repo = createMockRepo();
    const usuario = usuarioFixture({ email: 'antigo@example.com' });
    repo.obterPorId.mockResolvedValue(usuario);
    repo.existeEmail.mockResolvedValue(true);
    const useCase = new AtualizarUsuarioUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, usuario.id, { email: 'novo@example.com' }),
    ).rejects.toBeInstanceOf(EmailJaCadastradoError);
    expect(repo.atualizar).not.toHaveBeenCalled();
  });

  it('rejeita quando o usuário não existe', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(null);
    const useCase = new AtualizarUsuarioUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'inexistente', { nome: 'X' }),
    ).rejects.toBeInstanceOf(UsuarioNaoEncontradoError);
  });
});
