import type { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import type { TenantTransactionRunner } from '../../../../infra/prisma/tenant-transaction-runner';
import type { UsuarioDetalhado, UsuariosRepositoryPort } from '../ports/usuarios.repository.port';

/** Runner de teste: so' invoca `fn` direto, sem abrir transacao real - o `tx` passado nunca e' de fato usado (o repo e' mockado). */
export function createFakeTxRunner(): TenantTransactionRunner {
  return {
    run: (_empresaId, fn) => fn(undefined as never),
  };
}

export function createMockRepo(): jest.Mocked<UsuariosRepositoryPort> {
  return {
    criar: jest.fn(),
    listar: jest.fn(),
    obterPorId: jest.fn(),
    existeAuthUserId: jest.fn(),
    existeEmail: jest.fn(),
    atualizar: jest.fn(),
    definirAtivo: jest.fn(),
    contarAdministradoresAtivos: jest.fn(),
    obterPapelPorId: jest.fn(),
    usuarioTemPapel: jest.fn(),
    atribuirPapel: jest.fn(),
    removerPapel: jest.fn(),
  };
}

export function createMockAuditLog(): jest.Mocked<AuditLogService> {
  return { record: jest.fn() } as unknown as jest.Mocked<AuditLogService>;
}

export const TENANT_FIXTURE: TenantContext = {
  authUserId: 'auth-1',
  usuarioId: 'usuario-logado-1',
  empresaId: 'empresa-1',
  filialId: null,
  nome: 'Quem Está Logado',
  email: 'logado@example.com',
  papeis: ['ADMINISTRADOR'],
  permissoes: new Set(['usuarios.gerenciar', 'usuarios.gerenciarPermissoes']),
};

export function usuarioFixture(overrides: Partial<UsuarioDetalhado> = {}): UsuarioDetalhado {
  return {
    id: 'usuario-alvo-1',
    nome: 'Fulano',
    email: 'fulano@example.com',
    ativo: true,
    filialId: null,
    papeis: [{ id: 'papel-1', nome: 'VENDEDOR' }],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    authUserId: 'auth-2',
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    criadoPorNome: 'Quem Está Logado',
    atualizadoPorNome: 'Quem Está Logado',
    ...overrides,
  };
}
