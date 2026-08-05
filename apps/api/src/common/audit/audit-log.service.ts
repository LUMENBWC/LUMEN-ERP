import { Injectable } from '@nestjs/common';
import type { TenantScopedPrismaClient } from '../../infra/prisma/run-in-tenant-context';

export interface AuditLogEntry {
  usuarioId: string | null;
  entidade: string;
  entidadeId: string;
  acao: string;
  dadosAntes?: unknown;
  dadosDepois?: unknown;
  ip?: string | null;
}

/**
 * Writes an `AuditLog` row as part of the caller's transaction (spec Secao
 * 5.4). Takes the same tenant-scoped `tx` the use-case already has - the
 * tenant extension re-injects `empresaId` at runtime regardless of what's
 * passed here, but the Prisma-generated `data` type still requires it
 * explicitly (the extension only relaxes runtime behavior, not the types).
 */
@Injectable()
export class AuditLogService {
  async record(
    tx: TenantScopedPrismaClient,
    empresaId: string,
    entry: AuditLogEntry,
  ): Promise<void> {
    await tx.auditLog.create({
      data: {
        empresaId,
        usuarioId: entry.usuarioId,
        entidade: entry.entidade,
        entidadeId: entry.entidadeId,
        acao: entry.acao,
        dadosAntes: entry.dadosAntes === undefined ? undefined : (entry.dadosAntes as object),
        dadosDepois: entry.dadosDepois === undefined ? undefined : (entry.dadosDepois as object),
        ip: entry.ip ?? null,
      },
    });
  }
}
