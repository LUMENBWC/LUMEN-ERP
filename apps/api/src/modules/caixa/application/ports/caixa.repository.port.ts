import type { Prisma } from '../../../../../generated/prisma/client';

export type TipoMovimentoCaixaValue =
  'ABERTURA' | 'SUPRIMENTO' | 'SANGRIA' | 'VENDA' | 'FECHAMENTO';

export interface CaixaSessaoResumo {
  id: string;
  usuarioAberturaId: string;
  usuarioAberturaNome: string;
  valorAbertura: Prisma.Decimal;
  status: 'ABERTO' | 'FECHADO';
  abertoEm: Date;
}

export interface AbrirCaixaInput {
  valorAbertura: Prisma.Decimal;
}

export interface RegistrarMovimentoInput {
  caixaSessaoId: string;
  tipo: TipoMovimentoCaixaValue;
  valor: Prisma.Decimal;
  descricao?: string | null;
  origemTipo?: string;
  origemId?: string;
}

export interface CaixaRepositoryPort {
  /** Sessão de caixa aberta da empresa, se existir (uma por vez - ver ADR do módulo). */
  sessaoAbertaDaEmpresa(): Promise<CaixaSessaoResumo | null>;
  abrir(input: AbrirCaixaInput, usuarioId: string): Promise<CaixaSessaoResumo>;
  registrarMovimento(input: RegistrarMovimentoInput, usuarioId: string): Promise<void>;
}
