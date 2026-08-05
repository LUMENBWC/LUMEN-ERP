import {
  PapelNaoEncontradoError,
  UltimoAdministradorError,
  UsuarioNaoEncontradoError,
  UsuarioNaoTemPapelError,
} from '../../domain/usuario.errors';
import { RemoverPapelUseCase } from './remover-papel.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
  usuarioFixture,
} from './test-helpers';

describe('RemoverPapelUseCase', () => {
  it('remove um papel não-ADMINISTRADOR normalmente', async () => {
    const repo = createMockRepo();
    const alvo = usuarioFixture();
    repo.obterPorId.mockResolvedValue(alvo);
    repo.obterPapelPorId.mockResolvedValue({ id: 'papel-1', nome: 'VENDEDOR' });
    repo.usuarioTemPapel.mockResolvedValue(true);
    const auditLog = createMockAuditLog();
    const useCase = new RemoverPapelUseCase(createFakeTxRunner(), () => repo, auditLog);

    await useCase.execute(TENANT_FIXTURE, alvo.id, 'papel-1');

    expect(repo.removerPapel).toHaveBeenCalledWith(alvo.id, 'papel-1');
    expect(repo.contarAdministradoresAtivos).not.toHaveBeenCalled();
    expect(auditLog.record).toHaveBeenCalledWith(
      undefined,
      TENANT_FIXTURE.empresaId,
      expect.objectContaining({ acao: 'REMOVER_PAPEL' }),
    );
  });

  it('rejeita remover ADMINISTRADOR do último administrador ativo', async () => {
    const repo = createMockRepo();
    const admin = usuarioFixture({
      ativo: true,
      papeis: [{ id: 'p-admin', nome: 'ADMINISTRADOR' }],
    });
    repo.obterPorId.mockResolvedValue(admin);
    repo.obterPapelPorId.mockResolvedValue({ id: 'p-admin', nome: 'ADMINISTRADOR' });
    repo.usuarioTemPapel.mockResolvedValue(true);
    repo.contarAdministradoresAtivos.mockResolvedValue(0);
    const useCase = new RemoverPapelUseCase(createFakeTxRunner(), () => repo, createMockAuditLog());

    await expect(useCase.execute(TENANT_FIXTURE, admin.id, 'p-admin')).rejects.toBeInstanceOf(
      UltimoAdministradorError,
    );
    expect(repo.removerPapel).not.toHaveBeenCalled();
  });

  it('permite remover ADMINISTRADOR de um usuário já inativo (não conta para o mínimo)', async () => {
    const repo = createMockRepo();
    const admin = usuarioFixture({
      ativo: false,
      papeis: [{ id: 'p-admin', nome: 'ADMINISTRADOR' }],
    });
    repo.obterPorId.mockResolvedValue(admin);
    repo.obterPapelPorId.mockResolvedValue({ id: 'p-admin', nome: 'ADMINISTRADOR' });
    repo.usuarioTemPapel.mockResolvedValue(true);
    const useCase = new RemoverPapelUseCase(createFakeTxRunner(), () => repo, createMockAuditLog());

    await useCase.execute(TENANT_FIXTURE, admin.id, 'p-admin');

    expect(repo.contarAdministradoresAtivos).not.toHaveBeenCalled();
    expect(repo.removerPapel).toHaveBeenCalled();
  });

  it('rejeita quando o usuário não possui o papel', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(usuarioFixture());
    repo.obterPapelPorId.mockResolvedValue({ id: 'papel-1', nome: 'VENDEDOR' });
    repo.usuarioTemPapel.mockResolvedValue(false);
    const useCase = new RemoverPapelUseCase(createFakeTxRunner(), () => repo, createMockAuditLog());

    await expect(
      useCase.execute(TENANT_FIXTURE, 'usuario-alvo-1', 'papel-1'),
    ).rejects.toBeInstanceOf(UsuarioNaoTemPapelError);
  });

  it('rejeita quando usuário ou papel não existem', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(null);
    repo.obterPapelPorId.mockResolvedValue(null);
    repo.usuarioTemPapel.mockResolvedValue(false);
    const useCase = new RemoverPapelUseCase(createFakeTxRunner(), () => repo, createMockAuditLog());

    await expect(useCase.execute(TENANT_FIXTURE, 'x', 'y')).rejects.toBeInstanceOf(
      UsuarioNaoEncontradoError,
    );
  });

  it('rejeita quando o papel específico não existe (usuario existe)', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(usuarioFixture());
    repo.obterPapelPorId.mockResolvedValue(null);
    repo.usuarioTemPapel.mockResolvedValue(false);
    const useCase = new RemoverPapelUseCase(createFakeTxRunner(), () => repo, createMockAuditLog());

    await expect(
      useCase.execute(TENANT_FIXTURE, 'usuario-alvo-1', 'inexistente'),
    ).rejects.toBeInstanceOf(PapelNaoEncontradoError);
  });
});
