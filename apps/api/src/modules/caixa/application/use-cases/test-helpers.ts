import { Prisma } from '../../../../../generated/prisma/client';
import type { AuditLogService } from '../../../../common/audit/audit-log.service';
import type { TenantContext } from '../../../../common/tenant/resolve-tenant-context';
import type { TenantTransactionRunner } from '../../../../infra/prisma/tenant-transaction-runner';
import type { CaixaRepositoryPort, CaixaSessaoResumo } from '../ports/caixa.repository.port';

export function createFakeTxRunner(): TenantTransactionRunner {
  return { run: (_empresaId, fn) => fn(undefined as never) };
}

export function createMockRepo(): jest.Mocked<CaixaRepositoryPort> {
  return {
    sessaoAbertaDaEmpresa: jest.fn(),
    abrir: jest.fn(),
    registrarMovimento: jest.fn(),
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
  permissoes: new Set(['caixa.abrir', 'caixa.fechar', 'caixa.movimentar', 'vendas.criar']),
};

export function caixaSessaoFixture(overrides: Partial<CaixaSessaoResumo> = {}): CaixaSessaoResumo {
  return {
    id: 'caixa-sessao-1',
    usuarioAberturaId: TENANT_FIXTURE.usuarioId,
    usuarioAberturaNome: TENANT_FIXTURE.nome,
    valorAbertura: new Prisma.Decimal(100),
    status: 'ABERTO',
    abertoEm: new Date('2026-01-01T08:00:00.000Z'),
    ...overrides,
  };
}
