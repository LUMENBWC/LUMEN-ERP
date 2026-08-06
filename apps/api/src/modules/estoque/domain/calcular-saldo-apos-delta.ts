import { Prisma } from '../../../../generated/prisma/client';
import { EstoqueInsuficienteError } from './estoque.errors';

/**
 * Regra pura (spec Secao 3.2, "regra crítica"): ajuste manual e perda podem
 * reduzir o estoque abaixo de zero **apenas** com a permissão
 * `estoque.ajustarNegativo` - por padrão a operação é bloqueada antes de
 * chegar ao banco.
 */
export function calcularSaldoAposDelta(
  estoqueAtual: Prisma.Decimal,
  delta: Prisma.Decimal,
  permitirNegativo: boolean,
): Prisma.Decimal {
  const saldoApos = estoqueAtual.plus(delta);
  if (saldoApos.isNegative() && !permitirNegativo) {
    throw new EstoqueInsuficienteError();
  }
  return saldoApos;
}
