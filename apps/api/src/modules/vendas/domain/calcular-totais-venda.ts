import { Prisma } from '../../../../generated/prisma/client';

export interface ItemVendaInput {
  produtoId: string;
  quantidade: Prisma.Decimal;
  precoUnitario: Prisma.Decimal;
  desconto: Prisma.Decimal;
  custoUnitario: Prisma.Decimal;
}

export interface ItemVendaCalculado extends ItemVendaInput {
  total: Prisma.Decimal;
}

export interface TotaisVenda {
  itens: ItemVendaCalculado[];
  subtotal: Prisma.Decimal;
  total: Prisma.Decimal;
  custoTotal: Prisma.Decimal;
}

export function calcularTotaisVenda(
  itens: ItemVendaInput[],
  descontoGeral: Prisma.Decimal,
): TotaisVenda {
  const itensCalculados = itens.map((item) => ({
    ...item,
    total: item.quantidade.times(item.precoUnitario).minus(item.desconto),
  }));

  const subtotal = itensCalculados.reduce(
    (acc, item) => acc.plus(item.total),
    new Prisma.Decimal(0),
  );
  const total = Prisma.Decimal.max(subtotal.minus(descontoGeral), 0);
  const custoTotal = itensCalculados.reduce(
    (acc, item) => acc.plus(item.quantidade.times(item.custoUnitario)),
    new Prisma.Decimal(0),
  );

  return { itens: itensCalculados, subtotal, total, custoTotal };
}
