import { Prisma } from '../../../../generated/prisma/client';
import { calcularLucro } from './calcular-lucro';

describe('calcularLucro', () => {
  it('subtrai custo e despesas do faturamento', () => {
    const lucro = calcularLucro(
      new Prisma.Decimal(1000),
      new Prisma.Decimal(400),
      new Prisma.Decimal(100),
    );

    expect(lucro.toNumber()).toBe(500);
  });

  it('pode retornar prejuízo (negativo) quando custos e despesas superam o faturamento', () => {
    const lucro = calcularLucro(
      new Prisma.Decimal(100),
      new Prisma.Decimal(150),
      new Prisma.Decimal(50),
    );

    expect(lucro.toNumber()).toBe(-100);
  });

  it('retorna zero quando não há faturamento, custo nem despesas', () => {
    const lucro = calcularLucro(
      new Prisma.Decimal(0),
      new Prisma.Decimal(0),
      new Prisma.Decimal(0),
    );

    expect(lucro.toNumber()).toBe(0);
  });
});
