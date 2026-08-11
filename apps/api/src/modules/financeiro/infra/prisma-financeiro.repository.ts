import { Prisma } from '../../../../generated/prisma/client';
import type { TenantScopedPrismaClient } from '../../../infra/prisma/run-in-tenant-context';
import { agruparClientesInadimplentes } from '../domain/agrupar-clientes-inadimplentes';
import { estaVencida } from '../domain/esta-vencida';
import type {
  CategoriaDespesaResumo,
  ContaPagarDetalhada,
  ContaPagarResumo,
  ContaParaLancamento,
  ContaReceberDetalhada,
  ContaReceberResumo,
  CriarContaPagarInput,
  FinanceiroRepositoryPort,
  FormaPagamentoValue,
  ListarClientesInadimplentesFiltro,
  ListarClientesInadimplentesResultado,
  ListarContasPagarFiltro,
  ListarContasPagarResultado,
  ListarContasReceberFiltro,
  ListarContasReceberResultado,
  PagamentoResumo,
  RecebimentoResumo,
  RegistrarPagamentoInput,
  RegistrarRecebimentoInput,
  StatusContaValue,
} from '../application/ports/financeiro.repository.port';

interface ContaReceberRow {
  id: string;
  vendaId: string | null;
  clienteId: string | null;
  descricao: string;
  valorTotal: Prisma.Decimal;
  valorRecebido: Prisma.Decimal;
  vencimento: Date;
  status: string;
  parcelaNumero: number | null;
  parcelaTotal: number | null;
  createdAt: Date;
  cliente: { nome: string } | null;
}

interface ContaReceberRowDetalhada extends ContaReceberRow {
  recebimentos: {
    id: string;
    valor: Prisma.Decimal;
    data: Date;
    formaPagamento: string;
    usuarioId: string;
    usuario: { nome: string };
  }[];
}

interface ContaPagarRow {
  id: string;
  fornecedorId: string | null;
  categoriaDespesaId: string | null;
  descricao: string;
  valorTotal: Prisma.Decimal;
  valorPago: Prisma.Decimal;
  vencimento: Date;
  status: string;
  createdAt: Date;
  fornecedor: { nome: string } | null;
  categoriaDespesa: { nome: string } | null;
}

interface ContaPagarRowDetalhada extends ContaPagarRow {
  pagamentos: {
    id: string;
    valor: Prisma.Decimal;
    data: Date;
    usuarioId: string;
    usuario: { nome: string };
  }[];
}

const HOJE = () => new Date();

function paraContaReceberResumo(row: ContaReceberRow): ContaReceberResumo {
  const status = row.status as StatusContaValue;
  return {
    id: row.id,
    vendaId: row.vendaId,
    clienteId: row.clienteId,
    clienteNome: row.cliente?.nome ?? null,
    descricao: row.descricao,
    valorTotal: row.valorTotal,
    valorRecebido: row.valorRecebido,
    vencimento: row.vencimento,
    status,
    vencida: estaVencida(row.vencimento, status === 'CANCELADO' ? 'PAGO' : status, HOJE()),
    parcelaNumero: row.parcelaNumero,
    parcelaTotal: row.parcelaTotal,
    createdAt: row.createdAt,
  };
}

function paraRecebimentoResumo(
  row: ContaReceberRowDetalhada['recebimentos'][number],
): RecebimentoResumo {
  return {
    id: row.id,
    valor: row.valor,
    data: row.data,
    formaPagamento: row.formaPagamento as FormaPagamentoValue,
    usuarioId: row.usuarioId,
    usuarioNome: row.usuario.nome,
  };
}

function paraContaPagarResumo(row: ContaPagarRow): ContaPagarResumo {
  const status = row.status as StatusContaValue;
  return {
    id: row.id,
    fornecedorId: row.fornecedorId,
    fornecedorNome: row.fornecedor?.nome ?? null,
    categoriaDespesaId: row.categoriaDespesaId,
    categoriaDespesaNome: row.categoriaDespesa?.nome ?? null,
    descricao: row.descricao,
    valorTotal: row.valorTotal,
    valorPago: row.valorPago,
    vencimento: row.vencimento,
    status,
    vencida: estaVencida(row.vencimento, status === 'CANCELADO' ? 'PAGO' : status, HOJE()),
    createdAt: row.createdAt,
  };
}

function paraPagamentoResumo(row: ContaPagarRowDetalhada['pagamentos'][number]): PagamentoResumo {
  return {
    id: row.id,
    valor: row.valor,
    data: row.data,
    usuarioId: row.usuarioId,
    usuarioNome: row.usuario.nome,
  };
}

const INCLUDE_CONTA_RECEBER_RESUMO = {
  cliente: { select: { nome: true } },
} as const;

const INCLUDE_CONTA_RECEBER_DETALHADA = {
  ...INCLUDE_CONTA_RECEBER_RESUMO,
  recebimentos: { include: { usuario: { select: { nome: true } } }, orderBy: { data: 'asc' } },
} as const;

const INCLUDE_CONTA_PAGAR_RESUMO = {
  fornecedor: { select: { nome: true } },
  categoriaDespesa: { select: { nome: true } },
} as const;

const INCLUDE_CONTA_PAGAR_DETALHADA = {
  ...INCLUDE_CONTA_PAGAR_RESUMO,
  pagamentos: { include: { usuario: { select: { nome: true } } }, orderBy: { data: 'asc' } },
} as const;

export class PrismaFinanceiroRepository implements FinanceiroRepositoryPort {
  constructor(
    private readonly tx: TenantScopedPrismaClient,
    private readonly empresaId: string,
  ) {}

  // --- Contas a receber -----------------------------------------------

  async obterContaReceberComLock(id: string): Promise<ContaParaLancamento | null> {
    const rows = await this.tx.$queryRaw<
      { id: string; valorTotal: Prisma.Decimal; valorRecebido: Prisma.Decimal; status: string }[]
    >`
      SELECT id, "valorTotal", "valorRecebido", status
      FROM contas_receber
      WHERE id = ${id} AND "empresaId" = ${this.empresaId} AND "deletedAt" IS NULL
      FOR UPDATE
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      valorTotal: row.valorTotal,
      valorAcumulado: row.valorRecebido,
      status: row.status as StatusContaValue,
    };
  }

  async registrarRecebimento(input: RegistrarRecebimentoInput, usuarioId: string): Promise<void> {
    await this.tx.contaReceber.update({
      where: { id: input.contaReceberId },
      data: { valorRecebido: input.novoValorRecebido, status: input.novoStatus },
    });
    await this.tx.recebimentoRecebivel.create({
      data: {
        empresaId: this.empresaId,
        contaReceberId: input.contaReceberId,
        valor: input.valor,
        formaPagamento: input.formaPagamento,
        usuarioId,
      },
    });
  }

  async listarContasReceber(
    filtro: ListarContasReceberFiltro,
  ): Promise<ListarContasReceberResultado> {
    const where: Prisma.ContaReceberWhereInput = {
      deletedAt: null,
      ...(filtro.status ? { status: filtro.status } : {}),
      ...(filtro.clienteId ? { clienteId: filtro.clienteId } : {}),
      ...(filtro.vencido
        ? { status: { in: ['ABERTO', 'PARCIAL'] }, vencimento: { lt: HOJE() } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.tx.contaReceber.findMany({
        where,
        include: INCLUDE_CONTA_RECEBER_RESUMO,
        orderBy: { [filtro.sortBy]: filtro.sortDir },
        skip: (filtro.page - 1) * filtro.perPage,
        take: filtro.perPage,
      }),
      this.tx.contaReceber.count({ where }),
    ]);

    return { items: items.map(paraContaReceberResumo), total };
  }

  async obterContaReceberPorId(id: string): Promise<ContaReceberDetalhada | null> {
    const conta = await this.tx.contaReceber.findFirst({
      where: { id, deletedAt: null },
      include: INCLUDE_CONTA_RECEBER_DETALHADA,
    });
    if (!conta) return null;
    return {
      ...paraContaReceberResumo(conta),
      recebimentos: conta.recebimentos.map(paraRecebimentoResumo),
    };
  }

  async listarClientesInadimplentes(
    filtro: ListarClientesInadimplentesFiltro,
  ): Promise<ListarClientesInadimplentesResultado> {
    const contasVencidas = await this.tx.contaReceber.findMany({
      where: {
        deletedAt: null,
        clienteId: { not: null },
        status: { in: ['ABERTO', 'PARCIAL'] },
        vencimento: { lt: HOJE() },
      },
      select: {
        clienteId: true,
        valorTotal: true,
        valorRecebido: true,
        vencimento: true,
        cliente: { select: { nome: true } },
      },
    });

    const agrupados = agruparClientesInadimplentes(
      contasVencidas
        .filter(
          (conta): conta is typeof conta & { clienteId: string; cliente: { nome: string } } =>
            conta.clienteId !== null && conta.cliente !== null,
        )
        .map((conta) => ({
          clienteId: conta.clienteId,
          clienteNome: conta.cliente.nome,
          valorTotal: conta.valorTotal,
          valorRecebido: conta.valorRecebido,
          vencimento: conta.vencimento,
        })),
    );

    const inicio = (filtro.page - 1) * filtro.perPage;
    return { items: agrupados.slice(inicio, inicio + filtro.perPage), total: agrupados.length };
  }

  // --- Categorias de despesa --------------------------------------------

  async criarCategoriaDespesa(nome: string): Promise<CategoriaDespesaResumo> {
    const categoria = await this.tx.categoriaDespesa.create({
      data: { empresaId: this.empresaId, nome },
    });
    return { id: categoria.id, nome: categoria.nome, createdAt: categoria.createdAt };
  }

  async categoriaDespesaExistePorNome(nome: string): Promise<boolean> {
    const count = await this.tx.categoriaDespesa.count({ where: { nome, deletedAt: null } });
    return count > 0;
  }

  async categoriaDespesaExiste(id: string): Promise<boolean> {
    const count = await this.tx.categoriaDespesa.count({ where: { id, deletedAt: null } });
    return count > 0;
  }

  async listarCategoriasDespesa(): Promise<CategoriaDespesaResumo[]> {
    const categorias = await this.tx.categoriaDespesa.findMany({
      where: { deletedAt: null },
      orderBy: { nome: 'asc' },
    });
    return categorias.map((c) => ({ id: c.id, nome: c.nome, createdAt: c.createdAt }));
  }

  // --- Contas a pagar ------------------------------------------------

  async fornecedorExiste(id: string): Promise<boolean> {
    const count = await this.tx.fornecedor.count({ where: { id } });
    return count > 0;
  }

  async criarContaPagar(
    input: CriarContaPagarInput,
    usuarioId: string,
  ): Promise<ContaPagarDetalhada> {
    const conta = await this.tx.contaPagar.create({
      data: {
        empresaId: this.empresaId,
        fornecedorId: input.fornecedorId,
        categoriaDespesaId: input.categoriaDespesaId,
        descricao: input.descricao,
        valorTotal: input.valorTotal,
        vencimento: input.vencimento,
        createdById: usuarioId,
        updatedById: usuarioId,
      },
      include: INCLUDE_CONTA_PAGAR_DETALHADA,
    });
    return {
      ...paraContaPagarResumo(conta),
      pagamentos: conta.pagamentos.map(paraPagamentoResumo),
    };
  }

  async obterContaPagarComLock(id: string): Promise<ContaParaLancamento | null> {
    const rows = await this.tx.$queryRaw<
      { id: string; valorTotal: Prisma.Decimal; valorPago: Prisma.Decimal; status: string }[]
    >`
      SELECT id, "valorTotal", "valorPago", status
      FROM contas_pagar
      WHERE id = ${id} AND "empresaId" = ${this.empresaId} AND "deletedAt" IS NULL
      FOR UPDATE
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      valorTotal: row.valorTotal,
      valorAcumulado: row.valorPago,
      status: row.status as StatusContaValue,
    };
  }

  async registrarPagamento(input: RegistrarPagamentoInput, usuarioId: string): Promise<void> {
    await this.tx.contaPagar.update({
      where: { id: input.contaPagarId },
      data: { valorPago: input.novoValorPago, status: input.novoStatus, updatedById: usuarioId },
    });
    await this.tx.pagamentoPagavel.create({
      data: {
        empresaId: this.empresaId,
        contaPagarId: input.contaPagarId,
        valor: input.valor,
        usuarioId,
      },
    });
  }

  async listarContasPagar(filtro: ListarContasPagarFiltro): Promise<ListarContasPagarResultado> {
    const where: Prisma.ContaPagarWhereInput = {
      deletedAt: null,
      ...(filtro.status ? { status: filtro.status } : {}),
      ...(filtro.fornecedorId ? { fornecedorId: filtro.fornecedorId } : {}),
      ...(filtro.categoriaDespesaId ? { categoriaDespesaId: filtro.categoriaDespesaId } : {}),
      ...(filtro.vencido
        ? { status: { in: ['ABERTO', 'PARCIAL'] }, vencimento: { lt: HOJE() } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.tx.contaPagar.findMany({
        where,
        include: INCLUDE_CONTA_PAGAR_RESUMO,
        orderBy: { [filtro.sortBy]: filtro.sortDir },
        skip: (filtro.page - 1) * filtro.perPage,
        take: filtro.perPage,
      }),
      this.tx.contaPagar.count({ where }),
    ]);

    return { items: items.map(paraContaPagarResumo), total };
  }

  async obterContaPagarPorId(id: string): Promise<ContaPagarDetalhada | null> {
    const conta = await this.tx.contaPagar.findFirst({
      where: { id, deletedAt: null },
      include: INCLUDE_CONTA_PAGAR_DETALHADA,
    });
    if (!conta) return null;
    return {
      ...paraContaPagarResumo(conta),
      pagamentos: conta.pagamentos.map(paraPagamentoResumo),
    };
  }

  async cancelarContaPagar(id: string, usuarioId: string): Promise<void> {
    await this.tx.contaPagar.update({
      where: { id },
      data: { status: 'CANCELADO', updatedById: usuarioId },
    });
  }
}
