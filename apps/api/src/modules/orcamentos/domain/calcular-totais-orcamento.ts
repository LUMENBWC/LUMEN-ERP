import { Prisma } from '../../../../generated/prisma/client';

export interface ItemOrcamentoInput {
  quantidade: Prisma.Decimal;
  precoUnitario: Prisma.Decimal;
  desconto: Prisma.Decimal;
}

export interface ItemOrcamentoCalculado extends ItemOrcamentoInput {
  total: Prisma.Decimal;
}

export interface TotaisOrcamento {
  itens: ItemOrcamentoCalculado[];
  subtotal: Prisma.Decimal;
  total: Prisma.Decimal;
}

/**
 * Regra pura (spec Secao 3.5: "Cálculo automático de subtotal, descontos e
 * total") - nunca aceita subtotal/total do cliente, sempre deriva aqui.
 *
 * `total` de cada item = quantidade × precoUnitario − desconto (do item).
 * `subtotal` do orçamento = soma dos totais de item (antes do desconto
 * geral). `total` do orçamento = subtotal − descontoGeral, nunca negativo
 * (um desconto geral maior que o subtotal apenas zera o total).
 */
export function calcularTotaisOrcamento(
  itens: ItemOrcamentoInput[],
  descontoGeral: Prisma.Decimal,
): TotaisOrcamento {
  const itensCalculados = itens.map((item) => ({
    ...item,
    total: item.quantidade.times(item.precoUnitario).minus(item.desconto),
  }));
  const subtotal = itensCalculados.reduce(
    (acc, item) => acc.plus(item.total),
    new Prisma.Decimal(0),
  );
  const total = Prisma.Decimal.max(subtotal.minus(descontoGeral), 0);

  return { itens: itensCalculados, subtotal, total };
}
