import { Prisma } from '../../../../../generated/prisma/client';
import type { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import type { TenantTransactionRunner } from '../../../../infra/prisma/tenant-transaction-runner';
import type {
  DadosPdfOrcamento,
  OrcamentoDetalhado,
  OrcamentosRepositoryPort,
} from '../ports/orcamentos.repository.port';

export function createFakeTxRunner(): TenantTransactionRunner {
  return { run: (_empresaId, fn) => fn(undefined as never) };
}

export function createMockRepo(): jest.Mocked<OrcamentosRepositoryPort> {
  return {
    criar: jest.fn(),
    listar: jest.fn(),
    obterPorId: jest.fn(),
    clienteExiste: jest.fn(),
    produtosExistentes: jest.fn(),
    atualizar: jest.fn(),
    atualizarStatus: jest.fn(),
    cancelar: jest.fn(),
    salvarPdfUrl: jest.fn(),
    obterDadosParaPdf: jest.fn(),
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
  permissoes: new Set(['orcamentos.ler', 'orcamentos.gerenciar']),
};

export function orcamentoFixture(overrides: Partial<OrcamentoDetalhado> = {}): OrcamentoDetalhado {
  return {
    id: 'orcamento-1',
    clienteId: 'cliente-1',
    clienteNome: 'João da Silva',
    status: 'RASCUNHO',
    descontoGeral: new Prisma.Decimal(0),
    subtotal: new Prisma.Decimal(100),
    total: new Prisma.Decimal(100),
    validade: null,
    pdfUrl: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    observacoes: null,
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    criadoPorNome: 'Quem Está Logado',
    atualizadoPorNome: 'Quem Está Logado',
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
    ...overrides,
  };
}

export function dadosPdfFixture(overrides: Partial<DadosPdfOrcamento> = {}): DadosPdfOrcamento {
  return {
    id: 'orcamento-1',
    status: 'RASCUNHO',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    validade: null,
    descontoGeral: new Prisma.Decimal(0),
    subtotal: new Prisma.Decimal(100),
    total: new Prisma.Decimal(100),
    observacoes: null,
    clienteNome: 'João da Silva',
    clienteDocumento: '529.982.247-25',
    empresaRazaoSocial: 'Empresa Teste LTDA',
    empresaDocumento: '11.222.333/0001-81',
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
    ...overrides,
  };
}
