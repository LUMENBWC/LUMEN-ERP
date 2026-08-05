import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import type { TenantTransactionRunner } from '../../../../infra/prisma/tenant-transaction-runner';
import type { PapeisRepositoryPort } from '../ports/papeis.repository.port';
import { ListarPapeisUseCase } from './listar-papeis.use-case';

const TENANT: TenantContext = {
  authUserId: 'auth-1',
  usuarioId: 'usuario-1',
  empresaId: 'empresa-1',
  filialId: null,
  nome: 'Fulano',
  email: 'fulano@example.com',
  papeis: ['ADMINISTRADOR'],
  permissoes: new Set(['usuarios.gerenciar']),
};

function createFakeTxRunner(): TenantTransactionRunner {
  return { run: (_empresaId, fn) => fn(undefined as never) };
}

describe('ListarPapeisUseCase', () => {
  it('retorna os papéis da empresa com suas permissões', async () => {
    const papeis = [
      {
        id: 'p1',
        nome: 'ADMINISTRADOR',
        descricao: null,
        permissoes: [{ id: 'perm1', chave: 'usuarios.gerenciar', descricao: null }],
      },
    ];
    const repo: jest.Mocked<PapeisRepositoryPort> = {
      listarPapeisDaEmpresa: jest.fn().mockResolvedValue(papeis),
    };
    const useCase = new ListarPapeisUseCase(createFakeTxRunner(), () => repo);

    await expect(useCase.execute(TENANT)).resolves.toBe(papeis);
    expect(repo.listarPapeisDaEmpresa).toHaveBeenCalled();
  });
});
