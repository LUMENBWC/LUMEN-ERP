import { Prisma } from '../../../../generated/prisma/client';

/**
 * Regra pura (spec Secao 3.1): "margem de lucro calculada automaticamente a
 * partir de custo e venda; recalcular ao alterar qualquer um dos dois" -
 * nunca aceita o valor do cliente, só é derivada aqui.
 *
 * Fórmula: margem sobre o preço de venda ((venda - custo) / venda), fração
 * de 0 a 1 (ex.: 0.25 = 25%). `Prisma.Decimal` (decimal.js) em vez de
 * number/float, conforme a regra travada da spec para dinheiro (Secao 4) -
 * é o mesmo tipo Decimal que o schema Prisma já usa, não uma dependência
 * nova.
 */
export function calcularMargemLucro(
  precoCusto: Prisma.Decimal,
  precoVenda: Prisma.Decimal,
): Prisma.Decimal {
  if (precoVenda.isZero()) {
    return new Prisma.Decimal(0);
  }
  return precoVenda.minus(precoCusto).dividedBy(precoVenda).toDecimalPlaces(4);
}
