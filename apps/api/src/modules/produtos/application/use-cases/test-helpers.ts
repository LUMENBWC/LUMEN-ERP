import { Prisma } from '../../../../../generated/prisma/client';
import type { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import type { TenantTransactionRunner } from '../../../../infra/prisma/tenant-transaction-runner';
import type { ProdutoDetalhado, ProdutosRepositoryPort } from '../ports/produtos.repository.port';

export function createFakeTxRunner(): TenantTransactionRunner {
  return { run: (_empresaId, fn) => fn(undefined as never) };
}

export function createMockRepo(): jest.Mocked<ProdutosRepositoryPort> {
  return {
    criar: jest.fn(),
    listar: jest.fn(),
    obterPorId: jest.fn(),
    existeSku: jest.fn(),
    existeCodigoBarras: jest.fn(),
    categoriaExiste: jest.fn(),
    atualizar: jest.fn(),
    definirAtivo: jest.fn(),
    listarAbaixoDoMinimo: jest.fn(),
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

export function produtoFixture(overrides: Partial<ProdutoDetalhado> = {}): ProdutoDetalhado {
  return {
    id: 'produto-1',
    nome: 'Coca-Cola 2L',
    sku: 'SKU-001',
    codigoBarras: '7891000000001',
    unidadeMedida: 'UN',
    categoriaId: null,
    categoriaNome: null,
    precoCusto: new Prisma.Decimal(5),
    precoVenda: new Prisma.Decimal(8),
    margemLucro: new Prisma.Decimal('0.375'),
    estoqueAtual: new Prisma.Decimal(100),
    estoqueMinimo: new Prisma.Decimal(10),
    ativo: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    descricao: null,
    ncm: null,
    cfop: null,
    cst: null,
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    criadoPorNome: 'Quem Está Logado',
    atualizadoPorNome: 'Quem Está Logado',
    ...overrides,
  };
}
