import { Prisma } from '../../../../generated/prisma/client';
import type { TenantScopedPrismaClient } from '../../../infra/prisma/run-in-tenant-context';
import type {
  AtualizarProdutoInput,
  CriarProdutoInput,
  ListarProdutosFiltro,
  ListarProdutosResultado,
  ProdutoDetalhado,
  ProdutoResumo,
  ProdutosRepositoryPort,
  UnidadeMedidaValue,
} from '../application/ports/produtos.repository.port';

interface ProdutoRow {
  id: string;
  nome: string;
  sku: string;
  codigoBarras: string | null;
  unidadeMedida: string;
  categoriaId: string | null;
  precoCusto: Prisma.Decimal;
  precoVenda: Prisma.Decimal;
  margemLucro: Prisma.Decimal;
  estoqueAtual: Prisma.Decimal;
  estoqueMinimo: Prisma.Decimal;
  ativo: boolean;
  createdAt: Date;
  categoria: { nome: string } | null;
}

interface ProdutoRowDetalhado extends ProdutoRow {
  descricao: string | null;
  ncm: string | null;
  cfop: string | null;
  cst: string | null;
  updatedAt: Date;
  criadoPor: { nome: string } | null;
  atualizadoPor: { nome: string } | null;
}

function paraResumo(produto: ProdutoRow): ProdutoResumo {
  return {
    id: produto.id,
    nome: produto.nome,
    sku: produto.sku,
    codigoBarras: produto.codigoBarras,
    unidadeMedida: produto.unidadeMedida as UnidadeMedidaValue,
    categoriaId: produto.categoriaId,
    categoriaNome: produto.categoria?.nome ?? null,
    precoCusto: produto.precoCusto,
    precoVenda: produto.precoVenda,
    margemLucro: produto.margemLucro,
    estoqueAtual: produto.estoqueAtual,
    estoqueMinimo: produto.estoqueMinimo,
    ativo: produto.ativo,
    createdAt: produto.createdAt,
  };
}

function paraDetalhado(produto: ProdutoRowDetalhado): ProdutoDetalhado {
  return {
    ...paraResumo(produto),
    descricao: produto.descricao,
    ncm: produto.ncm,
    cfop: produto.cfop,
    cst: produto.cst,
    updatedAt: produto.updatedAt,
    criadoPorNome: produto.criadoPor?.nome ?? null,
    atualizadoPorNome: produto.atualizadoPor?.nome ?? null,
  };
}

const INCLUDE_DETALHADO = {
  categoria: { select: { nome: true } },
  criadoPor: { select: { nome: true } },
  atualizadoPor: { select: { nome: true } },
} as const;

export class PrismaProdutosRepository implements ProdutosRepositoryPort {
  constructor(
    private readonly tx: TenantScopedPrismaClient,
    private readonly empresaId: string,
  ) {}

  async criar(input: CriarProdutoInput, criadoPorId: string): Promise<ProdutoDetalhado> {
    const produto = await this.tx.produto.create({
      data: {
        empresaId: this.empresaId,
        nome: input.nome,
        descricao: input.descricao,
        sku: input.sku,
        codigoBarras: input.codigoBarras,
        unidadeMedida: input.unidadeMedida,
        categoriaId: input.categoriaId,
        precoCusto: input.precoCusto,
        precoVenda: input.precoVenda,
        margemLucro: input.margemLucro,
        estoqueMinimo: input.estoqueMinimo,
        ncm: input.ncm,
        cfop: input.cfop,
        cst: input.cst,
        createdById: criadoPorId,
        updatedById: criadoPorId,
      },
      include: INCLUDE_DETALHADO,
    });
    return paraDetalhado(produto);
  }

  async listar(filtro: ListarProdutosFiltro): Promise<ListarProdutosResultado> {
    const where: Prisma.ProdutoWhereInput = {
      ...(filtro.ativo !== undefined ? { ativo: filtro.ativo } : {}),
      ...(filtro.categoriaId ? { categoriaId: filtro.categoriaId } : {}),
      ...(filtro.busca
        ? {
            OR: [
              { nome: { contains: filtro.busca, mode: 'insensitive' as const } },
              { sku: { contains: filtro.busca, mode: 'insensitive' as const } },
              { codigoBarras: { contains: filtro.busca, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    if (filtro.abaixoDoMinimo) {
      const todos = await this.tx.produto.findMany({
        where: { ...where, ativo: true },
        include: { categoria: { select: { nome: true } } },
      });
      const abaixo = todos.filter(
        (p) => p.estoqueMinimo.greaterThan(0) && p.estoqueAtual.lessThan(p.estoqueMinimo),
      );
      return { items: abaixo.map(paraResumo), total: abaixo.length };
    }

    const [items, total] = await Promise.all([
      this.tx.produto.findMany({
        where,
        include: { categoria: { select: { nome: true } } },
        orderBy: { [filtro.sortBy]: filtro.sortDir },
        skip: (filtro.page - 1) * filtro.perPage,
        take: filtro.perPage,
      }),
      this.tx.produto.count({ where }),
    ]);

    return { items: items.map(paraResumo), total };
  }

  async obterPorId(id: string): Promise<ProdutoDetalhado | null> {
    const produto = await this.tx.produto.findUnique({ where: { id }, include: INCLUDE_DETALHADO });
    return produto ? paraDetalhado(produto) : null;
  }

  async existeSku(sku: string, excluindoId?: string): Promise<boolean> {
    const count = await this.tx.produto.count({
      where: { sku, ...(excluindoId ? { id: { not: excluindoId } } : {}) },
    });
    return count > 0;
  }

  async existeCodigoBarras(codigoBarras: string, excluindoId?: string): Promise<boolean> {
    const count = await this.tx.produto.count({
      where: { codigoBarras, ...(excluindoId ? { id: { not: excluindoId } } : {}) },
    });
    return count > 0;
  }

  async categoriaExiste(categoriaId: string): Promise<boolean> {
    const count = await this.tx.categoria.count({ where: { id: categoriaId } });
    return count > 0;
  }

  async atualizar(
    id: string,
    input: AtualizarProdutoInput,
    atualizadoPorId: string,
  ): Promise<ProdutoDetalhado> {
    const produto = await this.tx.produto.update({
      where: { id },
      data: { ...input, updatedById: atualizadoPorId },
      include: INCLUDE_DETALHADO,
    });
    return paraDetalhado(produto);
  }

  async definirAtivo(
    id: string,
    ativo: boolean,
    atualizadoPorId: string,
  ): Promise<ProdutoDetalhado> {
    const produto = await this.tx.produto.update({
      where: { id },
      data: { ativo, updatedById: atualizadoPorId },
      include: INCLUDE_DETALHADO,
    });
    return paraDetalhado(produto);
  }

  async listarAbaixoDoMinimo(): Promise<ProdutoResumo[]> {
    const produtos = await this.tx.produto.findMany({
      where: { ativo: true },
      include: { categoria: { select: { nome: true } } },
    });
    return produtos
      .filter((p) => p.estoqueMinimo.greaterThan(0) && p.estoqueAtual.lessThan(p.estoqueMinimo))
      .map(paraResumo);
  }
}
