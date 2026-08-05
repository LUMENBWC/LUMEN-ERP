import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/prisma/prisma.service';
import type { PermissaoResumo } from '../ports/papeis.repository.port';

/**
 * `Permissao` e' catalogo global (nao tenant-scoped - ver ADR-0002), lido
 * direto pela policy `catalog_select`, sem precisar de `runInTenantContext`.
 */
@Injectable()
export class ListarPermissoesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<PermissaoResumo[]> {
    const permissoes = await this.prisma.permissao.findMany({ orderBy: { chave: 'asc' } });
    return permissoes.map((p) => ({ id: p.id, chave: p.chave, descricao: p.descricao }));
  }
}
