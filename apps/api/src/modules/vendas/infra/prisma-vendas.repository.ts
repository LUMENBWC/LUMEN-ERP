import { Prisma } from '../../../../generated/prisma/client';
import type { TenantScopedPrismaClient } from '../../../infra/prisma/run-in-tenant-context';
import type {
  FormaPagamentoValue,
  ListarVendasFiltro,
  ListarVendasResultado,
  ProdutoParaVenda,
  SalvarVendaInput,
  StatusVendaValue,
  VendaDetalhada,
  VendaItemResumo,
  VendaPagamentoResumo,
  VendaResumo,
  VendasRepositoryPort,
} from '../application/ports/vendas.repository.port';

interface VendaRow {
  id: string;
  clienteId: string | null;
  status: string;
  subtotal: Prisma.Decimal;
  descontoGeral: Prisma.Decimal;
  total: Prisma.Decimal;
  custoTotal: Prisma.Decimal;
  usuarioId: string;
  createdAt: Date;
  cliente: { nome: string } | null;
  usuario: { nome: string };
}

interface VendaRowDetalhada extends VendaRow {
  itens: {
    id: string;
    produtoId: string;
    quantidade: Prisma.Decimal;
    precoUnitario: Prisma.Decimal;
    desconto: Prisma.Decimal;
    total: Prisma.Decimal;
    produto: { nome: string };
  }[];
  pagamentos: {
    id: string;
    formaPagamento: string;
    valor: Prisma.Decimal;
    parcelas: number | null;
    bandeira: string | null;
  }[];
}

function paraResumo(venda: VendaRow): VendaResumo {
  return {
    id: venda.id,
    clienteId: venda.clienteId,
    clienteNome: venda.cliente?.nome ?? null,
    status: venda.status as StatusVendaValue,
    subtotal: venda.subtotal,
    descontoGeral: venda.descontoGeral,
    total: venda.total,
    usuarioId: venda.usuarioId,
    usuarioNome: venda.usuario.nome,
    createdAt: venda.createdAt,
  };
}

function paraItemResumo(item: VendaRowDetalhada['itens'][number]): VendaItemResumo {
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

function paraPagamentoResumo(
  pagamento: VendaRowDetalhada['pagamentos'][number],
): VendaPagamentoResumo {
  return {
    id: pagamento.id,
    formaPagamento: pagamento.formaPagamento as FormaPagamentoValue,
    valor: pagamento.valor,
    parcelas: pagamento.parcelas,
    bandeira: pagamento.bandeira,
  };
}

function paraDetalhada(venda: VendaRowDetalhada): VendaDetalhada {
  return {
    ...paraResumo(venda),
    custoTotal: venda.custoTotal,
    itens: venda.itens.map(paraItemResumo),
    pagamentos: venda.pagamentos.map(paraPagamentoResumo),
  };
}

const INCLUDE_RESUMO = {
  cliente: { select: { nome: true } },
  usuario: { select: { nome: true } },
} as const;

const INCLUDE_DETALHADO = {
  ...INCLUDE_RESUMO,
  itens: { include: { produto: { select: { nome: true } } } },
  pagamentos: true,
} as const;

export class PrismaVendasRepository implements VendasRepositoryPort {
  constructor(
    private readonly tx: TenantScopedPrismaClient,
    private readonly empresaId: string,
  ) {}

  async clienteExiste(clienteId: string): Promise<boolean> {
    const count = await this.tx.cliente.count({ where: { id: clienteId } });
    return count > 0;
  }

  async obterProdutosComLock(produtoIds: string[]): Promise<Map<string, ProdutoParaVenda>> {
    const resultado = new Map<string, ProdutoParaVenda>();
    for (const produtoId of [...produtoIds].sort()) {
      // Um SELECT ... FOR UPDATE por produto, em ordem determinística de id,
      // pra evitar deadlock entre vendas concorrentes com produtos em comum
      // no carrinho em ordens diferentes (ver comentário na porta).
      const rows = await this.tx.$queryRaw<
        { id: string; nome: string; estoqueAtual: Prisma.Decimal; precoCusto: Prisma.Decimal }[]
      >`
        SELECT id, nome, "estoqueAtual", "precoCusto"
        FROM produtos
        WHERE id = ${produtoId} AND "empresaId" = ${this.empresaId}
        FOR UPDATE
      `;
      const produto = rows[0];
      if (produto) {
        resultado.set(produto.id, produto);
      }
    }
    return resultado;
  }

  async criar(input: SalvarVendaInput, usuarioId: string): Promise<VendaDetalhada> {
    const venda = await this.tx.venda.create({
      data: {
        empresaId: this.empresaId,
        clienteId: input.clienteId,
        orcamentoId: input.orcamentoId,
        caixaSessaoId: input.caixaSessaoId,
        subtotal: input.subtotal,
        descontoGeral: input.descontoGeral,
        total: input.total,
        custoTotal: input.custoTotal,
        usuarioId,
        itens: {
          create: input.itens.map((item) => ({
            empresaId: this.empresaId,
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            desconto: item.desconto,
            custoUnitario: item.custoUnitario,
            total: item.total,
          })),
        },
        pagamentos: {
          create: input.pagamentos.map((pagamento) => ({
            empresaId: this.empresaId,
            formaPagamento: pagamento.formaPagamento,
            valor: pagamento.valor,
            parcelas: pagamento.parcelas,
            bandeira: pagamento.bandeira,
          })),
        },
        contasReceber: {
          create: input.contasReceber.map((contaReceber) => ({
            empresaId: this.empresaId,
            clienteId: input.clienteId,
            descricao: contaReceber.descricao,
            valorTotal: contaReceber.valorTotal,
            valorRecebido: contaReceber.valorRecebido,
            vencimento: contaReceber.vencimento,
            status: contaReceber.status,
            parcelaNumero: contaReceber.parcelaNumero,
            parcelaTotal: contaReceber.parcelaTotal,
            ...(contaReceber.status === 'PAGO'
              ? {
                  recebimentos: {
                    create: [
                      {
                        empresaId: this.empresaId,
                        valor: contaReceber.valorRecebido,
                        formaPagamento: contaReceber.formaPagamento,
                        usuarioId,
                      },
                    ],
                  },
                }
              : {}),
          })),
        },
      },
      include: INCLUDE_DETALHADO,
    });
    return paraDetalhada(venda);
  }

  async obterPorId(id: string): Promise<VendaDetalhada | null> {
    const venda = await this.tx.venda.findFirst({
      where: { id, deletedAt: null },
      include: INCLUDE_DETALHADO,
    });
    return venda ? paraDetalhada(venda) : null;
  }

  async listar(filtro: ListarVendasFiltro): Promise<ListarVendasResultado> {
    const where: Prisma.VendaWhereInput = {
      deletedAt: null,
      ...(filtro.clienteId ? { clienteId: filtro.clienteId } : {}),
      ...(filtro.status ? { status: filtro.status } : {}),
      ...(filtro.dataInicio || filtro.dataFim
        ? {
            createdAt: {
              ...(filtro.dataInicio ? { gte: filtro.dataInicio } : {}),
              ...(filtro.dataFim ? { lte: filtro.dataFim } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.tx.venda.findMany({
        where,
        include: INCLUDE_RESUMO,
        orderBy: { createdAt: 'desc' },
        skip: (filtro.page - 1) * filtro.perPage,
        take: filtro.perPage,
      }),
      this.tx.venda.count({ where }),
    ]);

    return { items: items.map(paraResumo), total };
  }

  async cancelar(id: string): Promise<void> {
    await this.tx.contaReceber.updateMany({
      where: { vendaId: id, status: { in: ['ABERTO', 'PARCIAL'] } },
      data: { status: 'CANCELADO' },
    });
    await this.tx.venda.update({
      where: { id },
      data: { status: 'CANCELADA', deletedAt: new Date() },
    });
  }
}
