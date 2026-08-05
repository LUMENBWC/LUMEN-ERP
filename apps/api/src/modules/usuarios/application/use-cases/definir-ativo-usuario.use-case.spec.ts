import {
  NaoPodeDesativarASiMesmoError,
  UltimoAdministradorError,
  UsuarioNaoEncontradoError,
} from '../../domain/usuario.errors';
import { DefinirAtivoUsuarioUseCase } from './definir-ativo-usuario.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
  usuarioFixture,
} from './test-helpers';

describe('DefinirAtivoUsuarioUseCase', () => {
  it('desativa um usuário comum (sem papel ADMINISTRADOR) normalmente', async () => {
    const repo = createMockRepo();
    const alvo = usuarioFixture({
      id: 'outro-usuario',
      ativo: true,
      papeis: [{ id: 'p1', nome: 'VENDEDOR' }],
    });
    repo.obterPorId.mockResolvedValue(alvo);
    repo.definirAtivo.mockResolvedValue({ ...alvo, ativo: false });
    const auditLog = createMockAuditLog();
    const useCase = new DefinirAtivoUsuarioUseCase(createFakeTxRunner(), () => repo, auditLog);

    const resultado = await useCase.execute(TENANT_FIXTURE, 'outro-usuario', false);

    expect(resultado.ativo).toBe(false);
    expect(repo.definirAtivo).toHaveBeenCalledWith(
      'outro-usuario',
      false,
      TENANT_FIXTURE.usuarioId,
    );
    expect(auditLog.record).toHaveBeenCalledWith(
      undefined,
      TENANT_FIXTURE.empresaId,
      expect.objectContaining({ acao: 'DESATIVAR' }),
    );
  });

  it('rejeita quando o usuário logado tenta desativar a própria conta', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(usuarioFixture({ id: TENANT_FIXTURE.usuarioId }));
    const useCase = new DefinirAtivoUsuarioUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, TENANT_FIXTURE.usuarioId, false),
    ).rejects.toBeInstanceOf(NaoPodeDesativarASiMesmoError);
    expect(repo.definirAtivo).not.toHaveBeenCalled();
  });

  it('rejeita desativar o último ADMINISTRADOR ativo da empresa', async () => {
    const repo = createMockRepo();
    const admin = usuarioFixture({
      id: 'admin-2',
      papeis: [{ id: 'p-admin', nome: 'ADMINISTRADOR' }],
    });
    repo.obterPorId.mockResolvedValue(admin);
    repo.contarAdministradoresAtivos.mockResolvedValue(0);
    const useCase = new DefinirAtivoUsuarioUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, 'admin-2', false)).rejects.toBeInstanceOf(
      UltimoAdministradorError,
    );
    expect(repo.definirAtivo).not.toHaveBeenCalled();
  });

  it('permite desativar um ADMINISTRADOR quando existe outro administrador ativo', async () => {
    const repo = createMockRepo();
    const admin = usuarioFixture({
      id: 'admin-2',
      papeis: [{ id: 'p-admin', nome: 'ADMINISTRADOR' }],
    });
    repo.obterPorId.mockResolvedValue(admin);
    repo.contarAdministradoresAtivos.mockResolvedValue(1);
    repo.definirAtivo.mockResolvedValue({ ...admin, ativo: false });
    const useCase = new DefinirAtivoUsuarioUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, 'admin-2', false)).resolves.toMatchObject({
      ativo: false,
    });
  });

  it('reativar um usuário nunca dispara as checagens de último administrador', async () => {
    const repo = createMockRepo();
    const alvo = usuarioFixture({ id: 'outro-usuario', ativo: false });
    repo.obterPorId.mockResolvedValue(alvo);
    repo.definirAtivo.mockResolvedValue({ ...alvo, ativo: true });
    const useCase = new DefinirAtivoUsuarioUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await useCase.execute(TENANT_FIXTURE, 'outro-usuario', true);

    expect(repo.contarAdministradoresAtivos).not.toHaveBeenCalled();
  });

  it('rejeita quando o usuário não existe', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(null);
    const useCase = new DefinirAtivoUsuarioUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, 'inexistente', false)).rejects.toBeInstanceOf(
      UsuarioNaoEncontradoError,
    );
  });
});
