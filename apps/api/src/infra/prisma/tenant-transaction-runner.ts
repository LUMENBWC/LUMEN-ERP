import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { runInTenantContext, type TenantScopedPrismaClient } from './run-in-tenant-context';

/**
 * Abstraction over `runInTenantContext` so use-cases can be unit tested with
 * a fake runner (just invokes `fn` with a mock `tx`) instead of needing a
 * real Postgres connection - see ADR-0004 / spec Secao 11 ("cobertura de
 * testes... nos casos de uso").
 */
export interface TenantTransactionRunner {
  run<T>(empresaId: string, fn: (tx: TenantScopedPrismaClient) => Promise<T>): Promise<T>;
}

export const TENANT_TRANSACTION_RUNNER = Symbol('TENANT_TRANSACTION_RUNNER');

@Injectable()
export class PrismaTenantTransactionRunner implements TenantTransactionRunner {
  constructor(private readonly prisma: PrismaService) {}

  run<T>(empresaId: string, fn: (tx: TenantScopedPrismaClient) => Promise<T>): Promise<T> {
    return runInTenantContext(this.prisma, empresaId, fn);
  }
}
