import { Prisma } from '../../../../generated/prisma/client';
import { calcularFluxoCaixa } from './calcular-fluxo-caixa';

describe('calcularFluxoCaixa', () => {
  it('calcula o saldo como entradas menos saídas', () => {
    const fluxo = calcularFluxoCaixa(new Prisma.Decimal(500), new Prisma.Decimal(200));

    expect(fluxo.entradas.toNumber()).toBe(500);
    expect(fluxo.saidas.toNumber()).toBe(200);
    expect(fluxo.saldo.toNumber()).toBe(300);
  });

  it('saldo pode ficar negativo quando as saídas superam as entradas', () => {
    const fluxo = calcularFluxoCaixa(new Prisma.Decimal(100), new Prisma.Decimal(300));

    expect(fluxo.saldo.toNumber()).toBe(-200);
  });
});
