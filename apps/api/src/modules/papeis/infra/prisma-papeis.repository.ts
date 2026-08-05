import type { TenantScopedPrismaClient } from '../../../infra/prisma/run-in-tenant-context';
import type {
  PapeisRepositoryPort,
  PapelComPermissoes,
} from '../application/ports/papeis.repository.port';

export class PrismaPapeisRepository implements PapeisRepositoryPort {
  constructor(private readonly tx: TenantScopedPrismaClient) {}

  async listarPapeisDaEmpresa(): Promise<PapelComPermissoes[]> {
    const papeis = await this.tx.papel.findMany({
      include: { permissoes: { include: { permissao: true } } },
      orderBy: { nome: 'asc' },
    });

    return papeis.map((papel) => ({
      id: papel.id,
      nome: papel.nome,
      descricao: papel.descricao,
      permissoes: papel.permissoes.map((pp) => ({
        id: pp.permissao.id,
        chave: pp.permissao.chave,
        descricao: pp.permissao.descricao,
      })),
    }));
  }
}
