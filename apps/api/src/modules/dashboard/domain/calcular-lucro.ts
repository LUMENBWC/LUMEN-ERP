import { Prisma } from '../../../../generated/prisma/client';

/**
 * Lucro = faturamento − custo dos produtos vendidos − despesas pagas no
 * período (spec Secao 3.7). Não desconta despesas em aberto - só o que
 * efetivamente saiu do caixa/banco no período, pra não misturar regime de
 * competência com regime de caixa.
 */
export function calcularLucro(
  faturamento: Prisma.Decimal,
  custoProdutosVendidos: Prisma.Decimal,
  despesasPagas: Prisma.Decimal,
): Prisma.Decimal {
  return faturamento.minus(custoProdutosVendidos).minus(despesasPagas);
}
