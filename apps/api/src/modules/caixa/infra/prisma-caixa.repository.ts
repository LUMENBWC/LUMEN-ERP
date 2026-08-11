import { Prisma } from '../../../../generated/prisma/client';
import type { TenantScopedPrismaClient } from '../../../infra/prisma/run-in-tenant-context';
import { calcularValorEsperado } from '../domain/calcular-valor-esperado';
import type {
  AbrirCaixaInput,
  CaixaRepositoryPort,
  CaixaSessaoDetalhada,
  CaixaSessaoResumo,
  FecharCaixaInput,
  ListarSessoesFiltro,
  ListarSessoesResultado,
  MovimentoCaixaResumo,
  RegistrarMovimentoInput,
  TipoMovimentoCaixaValue,
} from '../application/ports/caixa.repository.port';

interface CaixaSessaoRow {
  id: string;
  usuarioAberturaId: string;
  valorAbertura: Prisma.Decimal;
  valorFechamentoInformado: Prisma.Decimal | null;
  valorFechamentoEsperado: Prisma.Decimal | null;
  diferenca: Prisma.Decimal | null;
  status: string;
  abertoEm: Date;
  fechadoEm: Date | null;
  usuarioAbertura: { nome: string };
}

interface MovimentoCaixaRow {
  id: string;
  tipo: string;
  valor: Prisma.Decimal;
  descricao: string | null;
  origemTipo: string | null;
  origemId: string | null;
  usuarioId: string;
  data: Date;
  usuario: { nome: string };
}

function paraResumo(row: CaixaSessaoRow): CaixaSessaoResumo {
  return {
    id: row.id,
    usuarioAberturaId: row.usuarioAberturaId,
    usuarioAberturaNome: row.usuarioAbertura.nome,
    valorAbertura: row.valorAbertura,
    status: row.status as CaixaSessaoResumo['status'],
    abertoEm: row.abertoEm,
  };
}

function paraMovimentoResumo(row: MovimentoCaixaRow): MovimentoCaixaResumo {
  return {
    id: row.id,
    tipo: row.tipo as TipoMovimentoCaixaValue,
    valor: row.valor,
    descricao: row.descricao,
    origemTipo: row.origemTipo,
    origemId: row.origemId,
    usuarioId: row.usuarioId,
    usuarioNome: row.usuario.nome,
    data: row.data,
  };
}

const INCLUDE_RESUMO = {
  usuarioAbertura: { select: { nome: true } },
} as const;

const INCLUDE_MOVIMENTO = {
  usuario: { select: { nome: true } },
} as const;

export class PrismaCaixaRepository implements CaixaRepositoryPort {
  constructor(
    private readonly tx: TenantScopedPrismaClient,
    private readonly empresaId: string,
  ) {}

  async sessaoAbertaDaEmpresa(): Promise<CaixaSessaoResumo | null> {
    const sessao = await this.tx.caixaSessao.findFirst({
      where: { status: 'ABERTO' },
      include: INCLUDE_RESUMO,
      orderBy: { abertoEm: 'desc' },
    });
    return sessao ? paraResumo(sessao) : null;
  }

  async abrir(input: AbrirCaixaInput, usuarioId: string): Promise<CaixaSessaoResumo> {
    const sessao = await this.tx.caixaSessao.create({
      data: {
        empresaId: this.empresaId,
        usuarioAberturaId: usuarioId,
        valorAbertura: input.valorAbertura,
      },
      include: INCLUDE_RESUMO,
    });
    return paraResumo(sessao);
  }

  async registrarMovimento(input: RegistrarMovimentoInput, usuarioId: string): Promise<void> {
    await this.tx.movimentoCaixa.create({
      data: {
        empresaId: this.empresaId,
        caixaSessaoId: input.caixaSessaoId,
        tipo: input.tipo,
        valor: input.valor,
        descricao: input.descricao ?? null,
        origemTipo: input.origemTipo ?? null,
        origemId: input.origemId ?? null,
        usuarioId,
      },
    });
  }

  async listarMovimentos(caixaSessaoId: string): Promise<MovimentoCaixaResumo[]> {
    const movimentos = await this.tx.movimentoCaixa.findMany({
      where: { caixaSessaoId },
      include: INCLUDE_MOVIMENTO,
      orderBy: { data: 'asc' },
    });
    return movimentos.map(paraMovimentoResumo);
  }

  async fechar(input: FecharCaixaInput): Promise<CaixaSessaoResumo> {
    const sessao = await this.tx.caixaSessao.update({
      where: { id: input.caixaSessaoId },
      data: {
        status: 'FECHADO',
        valorFechamentoInformado: input.valorFechamentoInformado,
        valorFechamentoEsperado: input.valorFechamentoEsperado,
        diferenca: input.diferenca,
        fechadoEm: new Date(),
      },
      include: INCLUDE_RESUMO,
    });
    return paraResumo(sessao);
  }

  async obterSessaoPorId(id: string): Promise<CaixaSessaoDetalhada | null> {
    const sessao = await this.tx.caixaSessao.findFirst({
      where: { id },
      include: INCLUDE_RESUMO,
    });
    if (!sessao) return null;

    const movimentos = await this.listarMovimentos(id);
    const valorEsperadoAtual = calcularValorEsperado(movimentos);

    return {
      ...paraResumo(sessao),
      valorFechamentoInformado: sessao.valorFechamentoInformado,
      valorFechamentoEsperado: sessao.valorFechamentoEsperado,
      diferenca: sessao.diferenca,
      fechadoEm: sessao.fechadoEm,
      valorEsperadoAtual,
      movimentos,
    };
  }

  async listarSessoes(filtro: ListarSessoesFiltro): Promise<ListarSessoesResultado> {
    const where: Prisma.CaixaSessaoWhereInput = {
      ...(filtro.status ? { status: filtro.status } : {}),
    };

    const [items, total] = await Promise.all([
      this.tx.caixaSessao.findMany({
        where,
        include: INCLUDE_RESUMO,
        orderBy: { [filtro.sortBy]: filtro.sortDir },
        skip: (filtro.page - 1) * filtro.perPage,
        take: filtro.perPage,
      }),
      this.tx.caixaSessao.count({ where }),
    ]);

    return { items: items.map(paraResumo), total };
  }
}
