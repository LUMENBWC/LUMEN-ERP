import { Prisma } from '../../../../../generated/prisma/client';
import type { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import type { TenantTransactionRunner } from '../../../../infra/prisma/tenant-transaction-runner';
import type {
  EstoqueRepositoryPort,
  MovimentacaoResumo,
  ProdutoParaMovimentacao,
} from '../ports/estoque.repository.port';

export function createFakeTxRunner(): TenantTransactionRunner {
  return { run: (_empresaId, fn) => fn(undefined as never) };
}

export function createMockRepo(): jest.Mocked<EstoqueRepositoryPort> {
  return {
    obterProdutoComLock: jest.fn(),
    registrarEntrada: jest.fn(),
    registrarDelta: jest.fn(),
    listar: jest.fn(),
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
  papeis: ['ESTOQUE'],
  permissoes: new Set(['estoque.ler', 'estoque.ajustar']),
};

export function produtoParaMovimentacaoFixture(
  overrides: Partial<ProdutoParaMovimentacao> = {},
): ProdutoParaMovimentacao {
  return {
    id: 'produto-1',
    nome: 'Coca-Cola 2L',
    estoqueAtual: new Prisma.Decimal(100),
    precoCusto: new Prisma.Decimal(5),
    precoVenda: new Prisma.Decimal(8),
    ...overrides,
  };
}

export function movimentacaoFixture(
  overrides: Partial<MovimentacaoResumo> = {},
): MovimentacaoResumo {
  return {
    id: 'movimentacao-1',
    produtoId: 'produto-1',
    produtoNome: 'Coca-Cola 2L',
    tipo: 'ENTRADA_COMPRA',
    quantidade: new Prisma.Decimal(50),
    custoUnitario: new Prisma.Decimal(5),
    saldoApos: new Prisma.Decimal(150),
    origemTipo: null,
    origemId: null,
    motivo: null,
    usuarioId: 'usuario-logado-1',
    usuarioNome: 'Quem Está Logado',
    fornecedorId: null,
    fornecedorNome: null,
    data: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}
