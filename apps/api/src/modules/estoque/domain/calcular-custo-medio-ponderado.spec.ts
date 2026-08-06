import { Prisma } from '../../../../generated/prisma/client';
import { calcularCustoMedioPonderado } from './calcular-custo-medio-ponderado';

describe('calcularCustoMedioPonderado', () => {
  it('pondera o custo existente e o da entrada pelas respectivas quantidades', () => {
    const custo = calcularCustoMedioPonderado(
      new Prisma.Decimal(100),
      new Prisma.Decimal(5),
      new Prisma.Decimal(100),
      new Prisma.Decimal(7),
    );
    expect(custo.toString()).toBe('6');
  });

  it('quando não havia estoque anterior, o novo custo é o custo da entrada', () => {
    const custo = calcularCustoMedioPonderado(
      new Prisma.Decimal(0),
      new Prisma.Decimal(0),
      new Prisma.Decimal(50),
      new Prisma.Decimal(10),
    );
    expect(custo.toString()).toBe('10');
  });

  it('arredonda em 2 casas decimais', () => {
    const custo = calcularCustoMedioPonderado(
      new Prisma.Decimal(1),
      new Prisma.Decimal(1),
      new Prisma.Decimal(1),
      new Prisma.Decimal(2),
    );
    expect(custo.toString()).toBe('1.5');
  });

  it('lida com quantidade e custo fracionários', () => {
    const custo = calcularCustoMedioPonderado(
      new Prisma.Decimal('10.5'),
      new Prisma.Decimal('3.20'),
      new Prisma.Decimal('4.5'),
      new Prisma.Decimal('4.00'),
    );
    // (10.5*3.20 + 4.5*4.00) / 15 = (33.6 + 18) / 15 = 51.6 / 15 = 3.44
    expect(custo.toString()).toBe('3.44');
  });
});
