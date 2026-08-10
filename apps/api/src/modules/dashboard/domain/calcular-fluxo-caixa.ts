import { Prisma } from '../../../../generated/prisma/client';

export interface FluxoCaixa {
  entradas: Prisma.Decimal;
  saidas: Prisma.Decimal;
  saldo: Prisma.Decimal;
}

export function calcularFluxoCaixa(entradas: Prisma.Decimal, saidas: Prisma.Decimal): FluxoCaixa {
  return { entradas, saidas, saldo: entradas.minus(saidas) };
}
