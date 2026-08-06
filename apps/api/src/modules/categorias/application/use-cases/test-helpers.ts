import type { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import type { TenantTransactionRunner } from '../../../../infra/prisma/tenant-transaction-runner';
import type {
  CategoriaResumo,
  CategoriasRepositoryPort,
} from '../ports/categorias.repository.port';

export function createFakeTxRunner(): TenantTransactionRunner {
  return { run: (_empresaId, fn) => fn(undefined as never) };
}

export function createMockRepo(): jest.Mocked<CategoriasRepositoryPort> {
  return {
    criar: jest.fn(),
    listar: jest.fn(),
    obterPorId: jest.fn(),
    existeNome: jest.fn(),
    temSubcategorias: jest.fn(),
    atualizar: jest.fn(),
    definirAtivo: jest.fn(),
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
  permissoes: new Set(['produtos.ler', 'produtos.gerenciar']),
};

export function categoriaFixture(overrides: Partial<CategoriaResumo> = {}): CategoriaResumo {
  return {
    id: 'categoria-1',
    nome: 'Bebidas',
    ativo: true,
    categoriaPaiId: null,
    categoriaPaiNome: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}
