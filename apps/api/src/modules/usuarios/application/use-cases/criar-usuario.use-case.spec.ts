import {
  AuthUserIdJaVinculadoError,
  EmailJaCadastradoError,
  PapelNaoEncontradoError,
} from '../../domain/usuario.errors';
import type { CriarUsuarioDto } from '../dto/criar-usuario.dto';
import { CriarUsuarioUseCase } from './criar-usuario.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
  usuarioFixture,
} from './test-helpers';

const dto: CriarUsuarioDto = {
  authUserId: 'auth-novo',
  nome: 'Novo Usuário',
  email: 'novo@example.com',
  filialId: null,
  papelId: 'papel-1',
};

describe('CriarUsuarioUseCase', () => {
  it('cria o usuário, atribui o papel e grava auditoria quando tudo é válido', async () => {
    const repo = createMockRepo();
    repo.existeAuthUserId.mockResolvedValue(false);
    repo.existeEmail.mockResolvedValue(false);
    repo.obterPapelPorId.mockResolvedValue({ id: 'papel-1', nome: 'VENDEDOR' });
    const criado = usuarioFixture({ authUserId: dto.authUserId, email: dto.email });
    repo.criar.mockResolvedValue(criado);

    const auditLog = createMockAuditLog();
    const useCase = new CriarUsuarioUseCase(createFakeTxRunner(), () => repo, auditLog);

    const resultado = await useCase.execute(TENANT_FIXTURE, dto);

    expect(resultado).toBe(criado);
    expect(repo.criar).toHaveBeenCalledWith(dto, TENANT_FIXTURE.usuarioId);
    expect(auditLog.record).toHaveBeenCalledWith(
      undefined,
      TENANT_FIXTURE.empresaId,
      expect.objectContaining({ acao: 'CRIAR', entidade: 'Usuario', entidadeId: criado.id }),
    );
  });

  it('rejeita quando authUserId já está vinculado a outro usuário da empresa', async () => {
    const repo = createMockRepo();
    repo.existeAuthUserId.mockResolvedValue(true);
    repo.existeEmail.mockResolvedValue(false);
    repo.obterPapelPorId.mockResolvedValue({ id: 'papel-1', nome: 'VENDEDOR' });
    const useCase = new CriarUsuarioUseCase(createFakeTxRunner(), () => repo, createMockAuditLog());

    await expect(useCase.execute(TENANT_FIXTURE, dto)).rejects.toBeInstanceOf(
      AuthUserIdJaVinculadoError,
    );
    expect(repo.criar).not.toHaveBeenCalled();
  });

  it('rejeita quando o e-mail já está em uso na empresa', async () => {
    const repo = createMockRepo();
    repo.existeAuthUserId.mockResolvedValue(false);
    repo.existeEmail.mockResolvedValue(true);
    repo.obterPapelPorId.mockResolvedValue({ id: 'papel-1', nome: 'VENDEDOR' });
    const useCase = new CriarUsuarioUseCase(createFakeTxRunner(), () => repo, createMockAuditLog());

    await expect(useCase.execute(TENANT_FIXTURE, dto)).rejects.toBeInstanceOf(
      EmailJaCadastradoError,
    );
    expect(repo.criar).not.toHaveBeenCalled();
  });

  it('rejeita quando o papel informado não existe', async () => {
    const repo = createMockRepo();
    repo.existeAuthUserId.mockResolvedValue(false);
    repo.existeEmail.mockResolvedValue(false);
    repo.obterPapelPorId.mockResolvedValue(null);
    const useCase = new CriarUsuarioUseCase(createFakeTxRunner(), () => repo, createMockAuditLog());

    await expect(useCase.execute(TENANT_FIXTURE, dto)).rejects.toBeInstanceOf(
      PapelNaoEncontradoError,
    );
    expect(repo.criar).not.toHaveBeenCalled();
  });
});
