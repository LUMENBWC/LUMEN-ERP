import {
  PapelNaoEncontradoError,
  UsuarioJaTemPapelError,
  UsuarioNaoEncontradoError,
} from '../../domain/usuario.errors';
import { AtribuirPapelUseCase } from './atribuir-papel.use-case';
import {
  TENANT_FIXTURE,
  createFakeTxRunner,
  createMockAuditLog,
  createMockRepo,
  usuarioFixture,
} from './test-helpers';

describe('AtribuirPapelUseCase', () => {
  it('atribui o papel e grava auditoria', async () => {
    const repo = createMockRepo();
    const alvo = usuarioFixture();
    repo.obterPorId.mockResolvedValueOnce(alvo).mockResolvedValueOnce({
      ...alvo,
      papeis: [...alvo.papeis, { id: 'papel-2', nome: 'CAIXA' }],
    });
    repo.obterPapelPorId.mockResolvedValue({ id: 'papel-2', nome: 'CAIXA' });
    repo.usuarioTemPapel.mockResolvedValue(false);
    const auditLog = createMockAuditLog();
    const useCase = new AtribuirPapelUseCase(createFakeTxRunner(), () => repo, auditLog);

    const resultado = await useCase.execute(TENANT_FIXTURE, alvo.id, 'papel-2');

    expect(repo.atribuirPapel).toHaveBeenCalledWith(alvo.id, 'papel-2');
    expect(resultado.papeis).toHaveLength(2);
    expect(auditLog.record).toHaveBeenCalledWith(
      undefined,
      TENANT_FIXTURE.empresaId,
      expect.objectContaining({ acao: 'ATRIBUIR_PAPEL' }),
    );
  });

  it('rejeita quando o usuário não existe', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(null);
    repo.obterPapelPorId.mockResolvedValue({ id: 'papel-2', nome: 'CAIXA' });
    repo.usuarioTemPapel.mockResolvedValue(false);
    const useCase = new AtribuirPapelUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(useCase.execute(TENANT_FIXTURE, 'inexistente', 'papel-2')).rejects.toBeInstanceOf(
      UsuarioNaoEncontradoError,
    );
  });

  it('rejeita quando o papel não existe', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(usuarioFixture());
    repo.obterPapelPorId.mockResolvedValue(null);
    repo.usuarioTemPapel.mockResolvedValue(false);
    const useCase = new AtribuirPapelUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'usuario-alvo-1', 'inexistente'),
    ).rejects.toBeInstanceOf(PapelNaoEncontradoError);
  });

  it('rejeita quando o usuário já possui o papel', async () => {
    const repo = createMockRepo();
    repo.obterPorId.mockResolvedValue(usuarioFixture());
    repo.obterPapelPorId.mockResolvedValue({ id: 'papel-1', nome: 'VENDEDOR' });
    repo.usuarioTemPapel.mockResolvedValue(true);
    const useCase = new AtribuirPapelUseCase(
      createFakeTxRunner(),
      () => repo,
      createMockAuditLog(),
    );

    await expect(
      useCase.execute(TENANT_FIXTURE, 'usuario-alvo-1', 'papel-1'),
    ).rejects.toBeInstanceOf(UsuarioJaTemPapelError);
    expect(repo.atribuirPapel).not.toHaveBeenCalled();
  });
});
