import { Prisma } from '../../../../../generated/prisma/client';
import type { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import type { TenantTransactionRunner } from '../../../../infra/prisma/tenant-transaction-runner';
import type {
  ProdutoParaVenda,
  VendaDetalhada,
  VendasRepositoryPort,
} from '../ports/vendas.repository.port';

export function createFakeTxRunner(): TenantTransactionRunner {
  return { run: (_empresaId, fn) => fn(undefined as never) };
}

export function createMockVendasRepo(): jest.Mocked<VendasRepositoryPort> {
  return {
    clienteExiste: jest.fn(),
    obterProdutosComLock: jest.fn(),
    criar: jest.fn(),
    obterPorId: jest.fn(),
    listar: jest.fn(),
    cancelar: jest.fn(),
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
  papeis: ['CAIXA'],
  permissoes: new Set(['vendas.criar', 'vendas.aplicarDesconto', 'vendas.cancelar']),
};

export function produtoParaVendaFixture(
  overrides: Partial<ProdutoParaVenda> = {},
): ProdutoParaVenda {
  return {
    id: 'produto-1',
    nome: 'Coca-Cola 2L',
    estoqueAtual: new Prisma.Decimal(100),
    precoCusto: new Prisma.Decimal(5),
    ...overrides,
  };
}

export function vendaDetalhadaFixture(overrides: Partial<VendaDetalhada> = {}): VendaDetalhada {
  return {
    id: 'venda-1',
    clienteId: null,
    clienteNome: null,
    status: 'CONCLUIDA',
    subtotal: new Prisma.Decimal(100),
    descontoGeral: new Prisma.Decimal(0),
    total: new Prisma.Decimal(100),
    custoTotal: new Prisma.Decimal(50),
    usuarioId: TENANT_FIXTURE.usuarioId,
    usuarioNome: TENANT_FIXTURE.nome,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    itens: [
      {
        id: 'item-1',
        produtoId: 'produto-1',
        produtoNome: 'Coca-Cola 2L',
        quantidade: new Prisma.Decimal(10),
        precoUnitario: new Prisma.Decimal(10),
        desconto: new Prisma.Decimal(0),
        total: new Prisma.Decimal(100),
      },
    ],
    pagamentos: [
      {
        id: 'pagamento-1',
        formaPagamento: 'DINHEIRO',
        valor: new Prisma.Decimal(100),
        parcelas: null,
        bandeira: null,
      },
    ],
    ...overrides,
  };
}
