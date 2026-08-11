import { Prisma } from '../../../../generated/prisma/client';
import type { TenantScopedPrismaClient } from '../../../infra/prisma/run-in-tenant-context';
import type {
  EstoqueRepositoryPort,
  ListarMovimentacoesFiltro,
  ListarMovimentacoesResultado,
  MovimentacaoResumo,
  ProdutoParaMovimentacao,
  RegistrarDeltaInput,
  RegistrarEntradaInput,
  TipoMovimentacaoValue,
} from '../application/ports/estoque.repository.port';

interface MovimentacaoRow {
  id: string;
  produtoId: string;
  tipo: string;
  quantidade: Prisma.Decimal;
  custoUnitario: Prisma.Decimal | null;
  saldoApos: Prisma.Decimal;
  origemTipo: string | null;
  origemId: string | null;
  motivo: string | null;
  usuarioId: string;
  fornecedorId: string | null;
  data: Date;
  produto: { nome: string };
  usuario: { nome: string };
  fornecedor: { nome: string } | null;
}

function paraResumo(row: MovimentacaoRow): MovimentacaoResumo {
  return {
    id: row.id,
    produtoId: row.produtoId,
    produtoNome: row.produto.nome,
    tipo: row.tipo as TipoMovimentacaoValue,
    quantidade: row.quantidade,
    custoUnitario: row.custoUnitario,
    saldoApos: row.saldoApos,
    origemTipo: row.origemTipo,
    origemId: row.origemId,
    motivo: row.motivo,
    usuarioId: row.usuarioId,
    usuarioNome: row.usuario.nome,
    fornecedorId: row.fornecedorId,
    fornecedorNome: row.fornecedor?.nome ?? null,
    data: row.data,
  };
}

const INCLUDE_RESUMO = {
  produto: { select: { nome: true } },
  usuario: { select: { nome: true } },
  fornecedor: { select: { nome: true } },
} as const;

export class PrismaEstoqueRepository implements EstoqueRepositoryPort {
  constructor(
    private readonly tx: TenantScopedPrismaClient,
    private readonly empresaId: string,
  ) {}

  async obterProdutoComLock(produtoId: string): Promise<ProdutoParaMovimentacao | null> {
    // $queryRaw não passa pela Prisma Client Extension de tenant scoping
    // (só intercepta os métodos de model) - o filtro por empresaId aqui é
    // manual, e a RLS (ADR-0002) cobre em profundidade caso ele seja
    // esquecido em algum outro lugar. FOR UPDATE prende a linha pelo resto
    // da transação, para que o custo médio ponderado / saldo resultante
    // nunca seja calculado em cima de um valor que outra transação
    // concorrente já sobrescreveu.
    const rows = await this.tx.$queryRaw<
      {
        id: string;
        nome: string;
        estoqueAtual: Prisma.Decimal;
        precoCusto: Prisma.Decimal;
        precoVenda: Prisma.Decimal;
      }[]
    >`
      SELECT id, nome, "estoqueAtual", "precoCusto", "precoVenda"
      FROM produtos
      WHERE id = ${produtoId} AND "empresaId" = ${this.empresaId}
      FOR UPDATE
    `;
    return rows[0] ?? null;
  }

  async fornecedorExiste(fornecedorId: string): Promise<boolean> {
    const count = await this.tx.fornecedor.count({ where: { id: fornecedorId } });
    return count > 0;
  }

  async registrarEntrada(
    input: RegistrarEntradaInput,
    usuarioId: string,
  ): Promise<MovimentacaoResumo> {
    const produtoAtualizado = await this.tx.produto.update({
      where: { id: input.produtoId },
      data: {
        estoqueAtual: { increment: input.quantidade },
        precoCusto: input.novoCustoMedio,
        margemLucro: input.novaMargemLucro,
      },
      select: { estoqueAtual: true },
    });

    const movimentacao = await this.tx.movimentacaoEstoque.create({
      data: {
        empresaId: this.empresaId,
        produtoId: input.produtoId,
        tipo: 'ENTRADA_COMPRA',
        quantidade: input.quantidade,
        custoUnitario: input.custoUnitario,
        saldoApos: produtoAtualizado.estoqueAtual,
        fornecedorId: input.fornecedorId,
        motivo: input.motivo,
        usuarioId,
      },
      include: INCLUDE_RESUMO,
    });

    return paraResumo(movimentacao);
  }

  async registrarDelta(input: RegistrarDeltaInput, usuarioId: string): Promise<MovimentacaoResumo> {
    await this.tx.produto.update({
      where: { id: input.produtoId },
      data: { estoqueAtual: input.saldoApos },
    });

    const movimentacao = await this.tx.movimentacaoEstoque.create({
      data: {
        empresaId: this.empresaId,
        produtoId: input.produtoId,
        tipo: input.tipo,
        quantidade: input.delta,
        saldoApos: input.saldoApos,
        motivo: input.motivo,
        origemTipo: input.origemTipo ?? null,
        origemId: input.origemId ?? null,
        usuarioId,
      },
      include: INCLUDE_RESUMO,
    });

    return paraResumo(movimentacao);
  }

  async listar(filtro: ListarMovimentacoesFiltro): Promise<ListarMovimentacoesResultado> {
    const where: Prisma.MovimentacaoEstoqueWhereInput = {
      ...(filtro.produtoId ? { produtoId: filtro.produtoId } : {}),
      ...(filtro.fornecedorId ? { fornecedorId: filtro.fornecedorId } : {}),
      ...(filtro.tipo ? { tipo: filtro.tipo } : {}),
      ...(filtro.dataInicio || filtro.dataFim
        ? {
            data: {
              ...(filtro.dataInicio ? { gte: filtro.dataInicio } : {}),
              ...(filtro.dataFim ? { lte: filtro.dataFim } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.tx.movimentacaoEstoque.findMany({
        where,
        include: INCLUDE_RESUMO,
        orderBy: { [filtro.sortBy]: filtro.sortDir },
        skip: (filtro.page - 1) * filtro.perPage,
        take: filtro.perPage,
      }),
      this.tx.movimentacaoEstoque.count({ where }),
    ]);

    return { items: items.map(paraResumo), total };
  }
}
