import { Prisma } from '../../../../../generated/prisma/client';
import type { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import type { TenantTransactionRunner } from '../../../../infra/prisma/tenant-transaction-runner';
import type { ClienteDetalhado, ClientesRepositoryPort } from '../ports/clientes.repository.port';

export function createFakeTxRunner(): TenantTransactionRunner {
  return { run: (_empresaId, fn) => fn(undefined as never) };
}

export function createMockRepo(): jest.Mocked<ClientesRepositoryPort> {
  return {
    criar: jest.fn(),
    listar: jest.fn(),
    obterPorId: jest.fn(),
    existeDocumento: jest.fn(),
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
  permissoes: new Set(['clientes.ler', 'clientes.gerenciar']),
};

export function clienteFixture(overrides: Partial<ClienteDetalhado> = {}): ClienteDetalhado {
  return {
    id: 'cliente-1',
    tipoPessoa: 'FISICA',
    nome: 'João da Silva',
    documento: '11144477735',
    telefone: null,
    whatsapp: null,
    email: null,
    cidade: null,
    uf: null,
    limiteCredito: new Prisma.Decimal(0),
    ativo: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    logradouro: null,
    numero: null,
    complemento: null,
    bairro: null,
    cep: null,
    observacoes: null,
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    criadoPorNome: 'Quem Está Logado',
    atualizadoPorNome: 'Quem Está Logado',
    ...overrides,
  };
}
