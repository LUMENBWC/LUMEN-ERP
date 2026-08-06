import { Prisma } from '../../../../generated/prisma/client';

/**
 * Regra pura (spec Secao 3.2): "Entrada por compra... pode atualizar
 * precoCusto (política: custo médio ponderado)". Pondera o custo já
 * registrado pelo estoque que já existia contra o custo da nova entrada,
 * pelas respectivas quantidades - o clássico custo médio ponderado de
 * estoque.
 *
 * Se não havia estoque anterior (ou o resultado da soma é zero, o que não
 * deveria acontecer numa entrada já que a quantidade é sempre positiva),
 * o novo custo é simplesmente o custo da entrada.
 */
export function calcularCustoMedioPonderado(
  estoqueAtual: Prisma.Decimal,
  custoAtual: Prisma.Decimal,
  quantidadeEntrada: Prisma.Decimal,
  custoEntrada: Prisma.Decimal,
): Prisma.Decimal {
  const novoEstoque = estoqueAtual.plus(quantidadeEntrada);
  if (novoEstoque.isZero()) {
    return custoEntrada;
  }
  return estoqueAtual
    .times(custoAtual)
    .plus(quantidadeEntrada.times(custoEntrada))
    .dividedBy(novoEstoque)
    .toDecimalPlaces(2);
}
