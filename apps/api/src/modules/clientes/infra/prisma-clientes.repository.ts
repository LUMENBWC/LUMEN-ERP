import { Prisma } from '../../../../generated/prisma/client';
import type { TenantScopedPrismaClient } from '../../../infra/prisma/run-in-tenant-context';
import type {
  AtualizarClienteInput,
  ClienteDetalhado,
  ClienteResumo,
  ClientesRepositoryPort,
  CriarClienteInput,
  ListarClientesFiltro,
  ListarClientesResultado,
  TipoPessoaValue,
} from '../application/ports/clientes.repository.port';

interface ClienteRow {
  id: string;
  tipoPessoa: string;
  nome: string;
  documento: string;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  cidade: string | null;
  uf: string | null;
  limiteCredito: Prisma.Decimal;
  ativo: boolean;
  createdAt: Date;
}

interface ClienteRowDetalhado extends ClienteRow {
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cep: string | null;
  inscricaoEstadual: string | null;
  observacoes: string | null;
  updatedAt: Date;
  criadoPor: { nome: string } | null;
  atualizadoPor: { nome: string } | null;
}

function paraResumo(cliente: ClienteRow): ClienteResumo {
  return {
    id: cliente.id,
    tipoPessoa: cliente.tipoPessoa as TipoPessoaValue,
    nome: cliente.nome,
    documento: cliente.documento,
    telefone: cliente.telefone,
    whatsapp: cliente.whatsapp,
    email: cliente.email,
    cidade: cliente.cidade,
    uf: cliente.uf,
    limiteCredito: cliente.limiteCredito,
    ativo: cliente.ativo,
    createdAt: cliente.createdAt,
  };
}

function paraDetalhado(cliente: ClienteRowDetalhado): ClienteDetalhado {
  return {
    ...paraResumo(cliente),
    logradouro: cliente.logradouro,
    numero: cliente.numero,
    complemento: cliente.complemento,
    bairro: cliente.bairro,
    cep: cliente.cep,
    inscricaoEstadual: cliente.inscricaoEstadual,
    observacoes: cliente.observacoes,
    updatedAt: cliente.updatedAt,
    criadoPorNome: cliente.criadoPor?.nome ?? null,
    atualizadoPorNome: cliente.atualizadoPor?.nome ?? null,
  };
}

const INCLUDE_DETALHADO = {
  criadoPor: { select: { nome: true } },
  atualizadoPor: { select: { nome: true } },
} as const;

export class PrismaClientesRepository implements ClientesRepositoryPort {
  constructor(
    private readonly tx: TenantScopedPrismaClient,
    private readonly empresaId: string,
  ) {}

  async criar(input: CriarClienteInput, criadoPorId: string): Promise<ClienteDetalhado> {
    const cliente = await this.tx.cliente.create({
      data: {
        empresaId: this.empresaId,
        tipoPessoa: input.tipoPessoa,
        nome: input.nome,
        documento: input.documento,
        telefone: input.telefone,
        whatsapp: input.whatsapp,
        email: input.email,
        logradouro: input.logradouro,
        numero: input.numero,
        complemento: input.complemento,
        bairro: input.bairro,
        cidade: input.cidade,
        uf: input.uf,
        cep: input.cep,
        inscricaoEstadual: input.inscricaoEstadual,
        limiteCredito: input.limiteCredito,
        observacoes: input.observacoes,
        createdById: criadoPorId,
        updatedById: criadoPorId,
      },
      include: INCLUDE_DETALHADO,
    });
    return paraDetalhado(cliente);
  }

  async listar(filtro: ListarClientesFiltro): Promise<ListarClientesResultado> {
    const where: Prisma.ClienteWhereInput = {
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
      this.tx.cliente.findMany({
        where,
        orderBy: { [filtro.sortBy]: filtro.sortDir },
        skip: (filtro.page - 1) * filtro.perPage,
        take: filtro.perPage,
      }),
      this.tx.cliente.count({ where }),
    ]);

    return { items: items.map(paraResumo), total };
  }

  async obterPorId(id: string): Promise<ClienteDetalhado | null> {
    const cliente = await this.tx.cliente.findUnique({ where: { id }, include: INCLUDE_DETALHADO });
    return cliente ? paraDetalhado(cliente) : null;
  }

  async existeDocumento(documento: string, excluindoId?: string): Promise<boolean> {
    const count = await this.tx.cliente.count({
      where: { documento, ...(excluindoId ? { id: { not: excluindoId } } : {}) },
    });
    return count > 0;
  }

  async atualizar(
    id: string,
    input: AtualizarClienteInput,
    atualizadoPorId: string,
  ): Promise<ClienteDetalhado> {
    const cliente = await this.tx.cliente.update({
      where: { id },
      data: { ...input, updatedById: atualizadoPorId },
      include: INCLUDE_DETALHADO,
    });
    return paraDetalhado(cliente);
  }

  async definirAtivo(
    id: string,
    ativo: boolean,
    atualizadoPorId: string,
  ): Promise<ClienteDetalhado> {
    const cliente = await this.tx.cliente.update({
      where: { id },
      data: { ativo, updatedById: atualizadoPorId },
      include: INCLUDE_DETALHADO,
    });
    return paraDetalhado(cliente);
  }
}
