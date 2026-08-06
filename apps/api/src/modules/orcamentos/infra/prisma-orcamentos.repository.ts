import { Prisma } from '../../../../generated/prisma/client';
import type { TenantScopedPrismaClient } from '../../../infra/prisma/run-in-tenant-context';
import type { StatusOrcamentoValue } from '../domain/garantir-transicao-status-valida';
import type {
  DadosPdfOrcamento,
  ItemOrcamentoParaSalvar,
  ListarOrcamentosFiltro,
  ListarOrcamentosResultado,
  OrcamentoDetalhado,
  OrcamentoItemResumo,
  OrcamentoResumo,
  OrcamentosRepositoryPort,
  SalvarOrcamentoInput,
} from '../application/ports/orcamentos.repository.port';

interface OrcamentoRow {
  id: string;
  clienteId: string;
  status: string;
  descontoGeral: Prisma.Decimal;
  subtotal: Prisma.Decimal;
  total: Prisma.Decimal;
  validade: Date | null;
  pdfUrl: string | null;
  createdAt: Date;
  cliente: { nome: string };
}

interface OrcamentoRowDetalhado extends OrcamentoRow {
  observacoes: string | null;
  updatedAt: Date;
  criadoPor: { nome: string } | null;
  atualizadoPor: { nome: string } | null;
  itens: {
    id: string;
    produtoId: string;
    quantidade: Prisma.Decimal;
    precoUnitario: Prisma.Decimal;
    desconto: Prisma.Decimal;
    total: Prisma.Decimal;
    produto: { nome: string };
  }[];
}

function paraResumo(orcamento: OrcamentoRow): OrcamentoResumo {
  return {
    id: orcamento.id,
    clienteId: orcamento.clienteId,
    clienteNome: orcamento.cliente.nome,
    status: orcamento.status as StatusOrcamentoValue,
    descontoGeral: orcamento.descontoGeral,
    subtotal: orcamento.subtotal,
    total: orcamento.total,
    validade: orcamento.validade,
    pdfUrl: orcamento.pdfUrl,
    createdAt: orcamento.createdAt,
  };
}

function paraItemResumo(item: OrcamentoRowDetalhado['itens'][number]): OrcamentoItemResumo {
  return {
    id: item.id,
    produtoId: item.produtoId,
    produtoNome: item.produto.nome,
    quantidade: item.quantidade,
    precoUnitario: item.precoUnitario,
    desconto: item.desconto,
    total: item.total,
  };
}

function paraDetalhado(orcamento: OrcamentoRowDetalhado): OrcamentoDetalhado {
  return {
    ...paraResumo(orcamento),
    observacoes: orcamento.observacoes,
    updatedAt: orcamento.updatedAt,
    criadoPorNome: orcamento.criadoPor?.nome ?? null,
    atualizadoPorNome: orcamento.atualizadoPor?.nome ?? null,
    itens: orcamento.itens.map(paraItemResumo),
  };
}

const INCLUDE_DETALHADO = {
  cliente: { select: { nome: true } },
  criadoPor: { select: { nome: true } },
  atualizadoPor: { select: { nome: true } },
  itens: { include: { produto: { select: { nome: true } } } },
} as const;

function itensParaCreateInput(itens: ItemOrcamentoParaSalvar[], empresaId: string) {
  return itens.map((item) => ({
    empresaId,
    produtoId: item.produtoId,
    quantidade: item.quantidade,
    precoUnitario: item.precoUnitario,
    desconto: item.desconto,
    total: item.total,
  }));
}

export class PrismaOrcamentosRepository implements OrcamentosRepositoryPort {
  constructor(
    private readonly tx: TenantScopedPrismaClient,
    private readonly empresaId: string,
  ) {}

  async criar(input: SalvarOrcamentoInput, criadoPorId: string): Promise<OrcamentoDetalhado> {
    const orcamento = await this.tx.orcamento.create({
      data: {
        empresaId: this.empresaId,
        clienteId: input.clienteId,
        descontoGeral: input.descontoGeral,
        subtotal: input.subtotal,
        total: input.total,
        validade: input.validade,
        observacoes: input.observacoes,
        createdById: criadoPorId,
        updatedById: criadoPorId,
        itens: { create: itensParaCreateInput(input.itens, this.empresaId) },
      },
      include: INCLUDE_DETALHADO,
    });
    return paraDetalhado(orcamento);
  }

  async listar(filtro: ListarOrcamentosFiltro): Promise<ListarOrcamentosResultado> {
    const where: Prisma.OrcamentoWhereInput = {
      deletedAt: null,
      ...(filtro.clienteId ? { clienteId: filtro.clienteId } : {}),
      ...(filtro.status ? { status: filtro.status } : {}),
    };

    const [items, total] = await Promise.all([
      this.tx.orcamento.findMany({
        where,
        include: { cliente: { select: { nome: true } } },
        orderBy: { [filtro.sortBy]: filtro.sortDir },
        skip: (filtro.page - 1) * filtro.perPage,
        take: filtro.perPage,
      }),
      this.tx.orcamento.count({ where }),
    ]);

    return { items: items.map(paraResumo), total };
  }

  async obterPorId(id: string): Promise<OrcamentoDetalhado | null> {
    const orcamento = await this.tx.orcamento.findFirst({
      where: { id, deletedAt: null },
      include: INCLUDE_DETALHADO,
    });
    return orcamento ? paraDetalhado(orcamento) : null;
  }

  async clienteExiste(clienteId: string): Promise<boolean> {
    const count = await this.tx.cliente.count({ where: { id: clienteId } });
    return count > 0;
  }

  async produtosExistentes(produtoIds: string[]): Promise<Set<string>> {
    const produtos = await this.tx.produto.findMany({
      where: { id: { in: produtoIds } },
      select: { id: true },
    });
    return new Set(produtos.map((p) => p.id));
  }

  async atualizar(
    id: string,
    input: SalvarOrcamentoInput,
    atualizadoPorId: string,
  ): Promise<OrcamentoDetalhado> {
    await this.tx.orcamentoItem.deleteMany({ where: { orcamentoId: id } });
    const orcamento = await this.tx.orcamento.update({
      where: { id },
      data: {
        clienteId: input.clienteId,
        descontoGeral: input.descontoGeral,
        subtotal: input.subtotal,
        total: input.total,
        validade: input.validade,
        observacoes: input.observacoes,
        updatedById: atualizadoPorId,
        itens: { create: itensParaCreateInput(input.itens, this.empresaId) },
      },
      include: INCLUDE_DETALHADO,
    });
    return paraDetalhado(orcamento);
  }

  async atualizarStatus(
    id: string,
    status: StatusOrcamentoValue,
    atualizadoPorId: string,
  ): Promise<OrcamentoDetalhado> {
    const orcamento = await this.tx.orcamento.update({
      where: { id },
      data: { status, updatedById: atualizadoPorId },
      include: INCLUDE_DETALHADO,
    });
    return paraDetalhado(orcamento);
  }

  async cancelar(id: string, atualizadoPorId: string): Promise<void> {
    await this.tx.orcamento.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: atualizadoPorId },
    });
  }

  async salvarPdfUrl(id: string, pdfUrl: string): Promise<void> {
    await this.tx.orcamento.update({ where: { id }, data: { pdfUrl } });
  }

  async obterDadosParaPdf(id: string): Promise<DadosPdfOrcamento | null> {
    const orcamento = await this.tx.orcamento.findFirst({
      where: { id, deletedAt: null },
      include: {
        cliente: { select: { nome: true, documento: true } },
        empresa: { select: { razaoSocial: true, documento: true } },
        itens: { include: { produto: { select: { nome: true } } } },
      },
    });
    if (!orcamento) return null;

    return {
      id: orcamento.id,
      status: orcamento.status as StatusOrcamentoValue,
      createdAt: orcamento.createdAt,
      validade: orcamento.validade,
      descontoGeral: orcamento.descontoGeral,
      subtotal: orcamento.subtotal,
      total: orcamento.total,
      observacoes: orcamento.observacoes,
      clienteNome: orcamento.cliente.nome,
      clienteDocumento: orcamento.cliente.documento,
      empresaRazaoSocial: orcamento.empresa.razaoSocial,
      empresaDocumento: orcamento.empresa.documento,
      itens: orcamento.itens.map(paraItemResumo),
    };
  }
}
