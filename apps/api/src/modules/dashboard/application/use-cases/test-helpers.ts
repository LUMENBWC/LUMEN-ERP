import { Prisma } from '../../../../../generated/prisma/client';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import type { TenantTransactionRunner } from '../../../../infra/prisma/tenant-transaction-runner';
import type {
  DashboardRepositoryPort,
  FaturamentoECusto,
  TotalEAging,
} from '../ports/dashboard.repository.port';

export function createFakeTxRunner(): TenantTransactionRunner {
  return { run: (_empresaId, fn) => fn(undefined as never) };
}

export function createMockRepo(): jest.Mocked<DashboardRepositoryPort> {
  return {
    obterFaturamentoECusto: jest.fn(),
    obterDespesasPagas: jest.fn(),
    obterTotalEAgingReceber: jest.fn(),
    obterTotalEAgingPagar: jest.fn(),
    obterProdutosMaisVendidos: jest.fn(),
    obterEntradasESaidasCaixa: jest.fn(),
  };
}

export const TENANT_FIXTURE: TenantContext = {
  authUserId: 'auth-1',
  usuarioId: 'usuario-logado-1',
  empresaId: 'empresa-1',
  filialId: null,
  nome: 'Quem Está Logado',
  email: 'logado@example.com',
  papeis: ['FINANCEIRO'],
  permissoes: new Set(['financeiro.ler']),
};

export function faturamentoECustoFixture(
  overrides: Partial<FaturamentoECusto> = {},
): FaturamentoECusto {
  return {
    faturamento: new Prisma.Decimal(1000),
    custoProdutosVendidos: new Prisma.Decimal(400),
    quantidadeVendas: 10,
    ...overrides,
  };
}

export function totalEAgingFixture(overrides: Partial<TotalEAging> = {}): TotalEAging {
  return {
    total: new Prisma.Decimal(300),
    aging: { aVencer: new Prisma.Decimal(200), vencido: new Prisma.Decimal(100) },
    ...overrides,
  };
}
