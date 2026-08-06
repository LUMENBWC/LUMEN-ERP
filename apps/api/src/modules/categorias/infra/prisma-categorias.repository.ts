import { Prisma } from '../../../../generated/prisma/client';
import type { TenantScopedPrismaClient } from '../../../infra/prisma/run-in-tenant-context';
import type {
  AtualizarCategoriaInput,
  CategoriaResumo,
  CategoriasRepositoryPort,
  CriarCategoriaInput,
  ListarCategoriasFiltro,
  ListarCategoriasResultado,
} from '../application/ports/categorias.repository.port';

interface CategoriaRow {
  id: string;
  nome: string;
  ativo: boolean;
  categoriaPaiId: string | null;
  createdAt: Date;
  categoriaPai: { nome: string } | null;
}

function paraResumo(categoria: CategoriaRow): CategoriaResumo {
  return {
    id: categoria.id,
    nome: categoria.nome,
    ativo: categoria.ativo,
    categoriaPaiId: categoria.categoriaPaiId,
    categoriaPaiNome: categoria.categoriaPai?.nome ?? null,
    createdAt: categoria.createdAt,
  };
}

export class PrismaCategoriasRepository implements CategoriasRepositoryPort {
  constructor(
    private readonly tx: TenantScopedPrismaClient,
    private readonly empresaId: string,
  ) {}

  async criar(input: CriarCategoriaInput, criadoPorId: string): Promise<CategoriaResumo> {
    const categoria = await this.tx.categoria.create({
      data: {
        empresaId: this.empresaId,
        nome: input.nome,
        categoriaPaiId: input.categoriaPaiId,
        createdById: criadoPorId,
        updatedById: criadoPorId,
      },
      include: { categoriaPai: { select: { nome: true } } },
    });
    return paraResumo(categoria);
  }

  async listar(filtro: ListarCategoriasFiltro): Promise<ListarCategoriasResultado> {
    const where: Prisma.CategoriaWhereInput = {
      ...(filtro.ativo !== undefined ? { ativo: filtro.ativo } : {}),
      ...(filtro.apenasRaiz ? { categoriaPaiId: null } : {}),
      ...(filtro.busca ? { nome: { contains: filtro.busca, mode: 'insensitive' as const } } : {}),
    };

    const [items, total] = await Promise.all([
      this.tx.categoria.findMany({
        where,
        include: { categoriaPai: { select: { nome: true } } },
        orderBy: { nome: 'asc' },
        skip: (filtro.page - 1) * filtro.perPage,
        take: filtro.perPage,
      }),
      this.tx.categoria.count({ where }),
    ]);

    return { items: items.map(paraResumo), total };
  }

  async obterPorId(id: string): Promise<CategoriaResumo | null> {
    const categoria = await this.tx.categoria.findUnique({
      where: { id },
      include: { categoriaPai: { select: { nome: true } } },
    });
    return categoria ? paraResumo(categoria) : null;
  }

  async existeNome(nome: string, excluindoId?: string): Promise<boolean> {
    const count = await this.tx.categoria.count({
      where: { nome, ...(excluindoId ? { id: { not: excluindoId } } : {}) },
    });
    return count > 0;
  }

  async temSubcategorias(id: string): Promise<boolean> {
    const count = await this.tx.categoria.count({ where: { categoriaPaiId: id } });
    return count > 0;
  }

  async atualizar(
    id: string,
    input: AtualizarCategoriaInput,
    atualizadoPorId: string,
  ): Promise<CategoriaResumo> {
    const categoria = await this.tx.categoria.update({
      where: { id },
      data: { ...input, updatedById: atualizadoPorId },
      include: { categoriaPai: { select: { nome: true } } },
    });
    return paraResumo(categoria);
  }

  async definirAtivo(
    id: string,
    ativo: boolean,
    atualizadoPorId: string,
  ): Promise<CategoriaResumo> {
    const categoria = await this.tx.categoria.update({
      where: { id },
      data: { ativo, updatedById: atualizadoPorId },
      include: { categoriaPai: { select: { nome: true } } },
    });
    return paraResumo(categoria);
  }
}
