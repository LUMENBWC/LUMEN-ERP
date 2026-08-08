import { Prisma } from '../../../../../generated/prisma/client';
import type { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import type { TenantTransactionRunner } from '../../../../infra/prisma/tenant-transaction-runner';
import type {
  CategoriaDespesaResumo,
  ContaPagarDetalhada,
  ContaParaLancamento,
  ContaReceberDetalhada,
  FinanceiroRepositoryPort,
} from '../ports/financeiro.repository.port';

export function createFakeTxRunner(): TenantTransactionRunner {
  return { run: (_empresaId, fn) => fn(undefined as never) };
}

export function createMockRepo(): jest.Mocked<FinanceiroRepositoryPort> {
  return {
    obterContaReceberComLock: jest.fn(),
    registrarRecebimento: jest.fn(),
    listarContasReceber: jest.fn(),
    obterContaReceberPorId: jest.fn(),
    criarCategoriaDespesa: jest.fn(),
    categoriaDespesaExistePorNome: jest.fn(),
    categoriaDespesaExiste: jest.fn(),
    listarCategoriasDespesa: jest.fn(),
    fornecedorExiste: jest.fn(),
    criarContaPagar: jest.fn(),
    obterContaPagarComLock: jest.fn(),
    registrarPagamento: jest.fn(),
    listarContasPagar: jest.fn(),
    obterContaPagarPorId: jest.fn(),
    cancelarContaPagar: jest.fn(),
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
  papeis: ['FINANCEIRO'],
  permissoes: new Set(['financeiro.ler', 'financeiro.gerenciar']),
};

export function contaParaLancamentoFixture(
  overrides: Partial<ContaParaLancamento> = {},
): ContaParaLancamento {
  return {
    id: 'conta-1',
    valorTotal: new Prisma.Decimal(100),
    valorAcumulado: new Prisma.Decimal(0),
    status: 'ABERTO',
    ...overrides,
  };
}

export function contaReceberDetalhadaFixture(
  overrides: Partial<ContaReceberDetalhada> = {},
): ContaReceberDetalhada {
  return {
    id: 'conta-1',
    vendaId: null,
    clienteId: null,
    clienteNome: null,
    descricao: 'Venda - DINHEIRO',
    valorTotal: new Prisma.Decimal(100),
    valorRecebido: new Prisma.Decimal(0),
    vencimento: new Date('2026-01-01T00:00:00.000Z'),
    status: 'ABERTO',
    vencida: false,
    parcelaNumero: null,
    parcelaTotal: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    recebimentos: [],
    ...overrides,
  };
}

export function contaPagarDetalhadaFixture(
  overrides: Partial<ContaPagarDetalhada> = {},
): ContaPagarDetalhada {
  return {
    id: 'conta-pagar-1',
    fornecedorId: null,
    fornecedorNome: null,
    categoriaDespesaId: null,
    categoriaDespesaNome: null,
    descricao: 'Aluguel',
    valorTotal: new Prisma.Decimal(500),
    valorPago: new Prisma.Decimal(0),
    vencimento: new Date('2026-01-01T00:00:00.000Z'),
    status: 'ABERTO',
    vencida: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    pagamentos: [],
    ...overrides,
  };
}

export function categoriaDespesaFixture(
  overrides: Partial<CategoriaDespesaResumo> = {},
): CategoriaDespesaResumo {
  return {
    id: 'categoria-1',
    nome: 'Aluguel',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}
