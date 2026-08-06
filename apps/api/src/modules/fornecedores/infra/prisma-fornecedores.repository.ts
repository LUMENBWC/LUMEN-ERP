import { Prisma } from '../../../../generated/prisma/client';
import type { TenantScopedPrismaClient } from '../../../infra/prisma/run-in-tenant-context';
import type {
  AtualizarFornecedorInput,
  CriarFornecedorInput,
  FornecedorDetalhado,
  FornecedorResumo,
  FornecedoresRepositoryPort,
  ListarFornecedoresFiltro,
  ListarFornecedoresResultado,
  TipoPessoaValue,
} from '../application/ports/fornecedores.repository.port';

interface FornecedorRow {
  id: string;
  tipoPessoa: string;
  nome: string;
  documento: string;
  telefone: string | null;
  email: string | null;
  cidade: string | null;
  uf: string | null;
  ativo: boolean;
  createdAt: Date;
}

interface FornecedorRowDetalhado extends FornecedorRow {
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cep: string | null;
  observacoes: string | null;
  updatedAt: Date;
  criadoPor: { nome: string } | null;
  atualizadoPor: { nome: string } | null;
  produtos: { produtoId: string; produto: { nome: string; sku: string } }[];
}

function paraResumo(fornecedor: FornecedorRow): FornecedorResumo {
  return {
    id: fornecedor.id,
    tipoPessoa: fornecedor.tipoPessoa as TipoPessoaValue,
    nome: fornecedor.nome,
    documento: fornecedor.documento,
    telefone: fornecedor.telefone,
    email: fornecedor.email,
    cidade: fornecedor.cidade,
    uf: fornecedor.uf,
    ativo: fornecedor.ativo,
    createdAt: fornecedor.createdAt,
  };
}

function paraDetalhado(fornecedor: FornecedorRowDetalhado): FornecedorDetalhado {
  return {
    ...paraResumo(fornecedor),
    logradouro: fornecedor.logradouro,
    numero: fornecedor.numero,
    complemento: fornecedor.complemento,
    bairro: fornecedor.bairro,
    cep: fornecedor.cep,
    observacoes: fornecedor.observacoes,
    updatedAt: fornecedor.updatedAt,
    criadoPorNome: fornecedor.criadoPor?.nome ?? null,
    atualizadoPorNome: fornecedor.atualizadoPor?.nome ?? null,
    produtos: fornecedor.produtos.map((p) => ({
      produtoId: p.produtoId,
      produtoNome: p.produto.nome,
      produtoSku: p.produto.sku,
    })),
  };
}

const INCLUDE_DETALHADO = {
  criadoPor: { select: { nome: true } },
  atualizadoPor: { select: { nome: true } },
  produtos: { select: { produtoId: true, produto: { select: { nome: true, sku: true } } } },
} as const;

export class PrismaFornecedoresRepository implements FornecedoresRepositoryPort {
  constructor(
    private readonly tx: TenantScopedPrismaClient,
    private readonly empresaId: string,
  ) {}

  async criar(input: CriarFornecedorInput, criadoPorId: string): Promise<FornecedorDetalhado> {
    const fornecedor = await this.tx.fornecedor.create({
      data: {
        empresaId: this.empresaId,
        tipoPessoa: input.tipoPessoa,
        nome: input.nome,
        documento: input.documento,
        telefone: input.telefone,
        email: input.email,
        logradouro: input.logradouro,
        numero: input.numero,
        complemento: input.complemento,
        bairro: input.bairro,
        cidade: input.cidade,
        uf: input.uf,
        cep: input.cep,
        observacoes: input.observacoes,
        createdById: criadoPorId,
        updatedById: criadoPorId,
      },
      include: INCLUDE_DETALHADO,
    });
    return paraDetalhado(fornecedor);
  }

  async listar(filtro: ListarFornecedoresFiltro): Promise<ListarFornecedoresResultado> {
    const where: Prisma.FornecedorWhereInput = {
      ...(filtro.ativo !== undefined ? { ativo: filtro.ativo } : {}),
      ...(filtro.tipoPessoa ? { tipoPessoa: filtro.tipoPessoa } : {}),
      ...(filtro.busca
        ? {
            OR: [
              { nome: { contains: filtro.busca, mode: 'insensitive' as const } },
              { documento: { contains: filtro.busca, mode: 'insensitive' as const } },
              { email: { contains: filtro.busca, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.tx.fornecedor.findMany({
        where,
        orderBy: { [filtro.sortBy]: filtro.sortDir },
        skip: (filtro.page - 1) * filtro.perPage,
        take: filtro.perPage,
      }),
      this.tx.fornecedor.count({ where }),
    ]);

    return { items: items.map(paraResumo), total };
  }

  async obterPorId(id: string): Promise<FornecedorDetalhado | null> {
    const fornecedor = await this.tx.fornecedor.findUnique({
      where: { id },
      include: INCLUDE_DETALHADO,
    });
    return fornecedor ? paraDetalhado(fornecedor) : null;
  }

  async existeDocumento(documento: string, excluindoId?: string): Promise<boolean> {
    const count = await this.tx.fornecedor.count({
      where: { documento, ...(excluindoId ? { id: { not: excluindoId } } : {}) },
    });
    return count > 0;
  }

  async atualizar(
    id: string,
    input: AtualizarFornecedorInput,
    atualizadoPorId: string,
  ): Promise<FornecedorDetalhado> {
    const fornecedor = await this.tx.fornecedor.update({
      where: { id },
      data: { ...input, updatedById: atualizadoPorId },
      include: INCLUDE_DETALHADO,
    });
    return paraDetalhado(fornecedor);
  }

  async definirAtivo(
    id: string,
    ativo: boolean,
    atualizadoPorId: string,
  ): Promise<FornecedorDetalhado> {
    const fornecedor = await this.tx.fornecedor.update({
      where: { id },
      data: { ativo, updatedById: atualizadoPorId },
      include: INCLUDE_DETALHADO,
    });
    return paraDetalhado(fornecedor);
  }

  async produtoExiste(produtoId: string): Promise<boolean> {
    const count = await this.tx.produto.count({ where: { id: produtoId } });
    return count > 0;
  }

  async vinculoExiste(fornecedorId: string, produtoId: string): Promise<boolean> {
    const count = await this.tx.fornecedorProduto.count({ where: { fornecedorId, produtoId } });
    return count > 0;
  }

  async vincularProduto(fornecedorId: string, produtoId: string): Promise<void> {
    await this.tx.fornecedorProduto.create({
      data: { empresaId: this.empresaId, fornecedorId, produtoId },
    });
  }

  async desvincularProduto(fornecedorId: string, produtoId: string): Promise<void> {
    await this.tx.fornecedorProduto.deleteMany({ where: { fornecedorId, produtoId } });
  }
}
