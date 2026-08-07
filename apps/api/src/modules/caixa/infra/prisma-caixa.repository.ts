import type { TenantScopedPrismaClient } from '../../../infra/prisma/run-in-tenant-context';
import type {
  AbrirCaixaInput,
  CaixaRepositoryPort,
  CaixaSessaoResumo,
  RegistrarMovimentoInput,
} from '../application/ports/caixa.repository.port';

interface CaixaSessaoRow {
  id: string;
  usuarioAberturaId: string;
  valorAbertura: CaixaSessaoResumo['valorAbertura'];
  status: string;
  abertoEm: Date;
  usuarioAbertura: { nome: string };
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

const INCLUDE_RESUMO = {
  usuarioAbertura: { select: { nome: true } },
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
}
