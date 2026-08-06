import { Prisma } from '../../../../generated/prisma/client';
import { calcularMargemLucro } from './calcular-margem-lucro';

describe('calcularMargemLucro', () => {
  it('calcula a margem sobre o preço de venda', () => {
    const margem = calcularMargemLucro(new Prisma.Decimal(60), new Prisma.Decimal(100));
    expect(margem.toString()).toBe('0.4');
  });

  it('retorna 0 quando custo e venda são iguais', () => {
    const margem = calcularMargemLucro(new Prisma.Decimal(50), new Prisma.Decimal(50));
    expect(margem.toString()).toBe('0');
  });

  it('retorna margem negativa quando custo é maior que venda (venda com prejuízo)', () => {
    const margem = calcularMargemLucro(new Prisma.Decimal(120), new Prisma.Decimal(100));
    expect(margem.toString()).toBe('-0.2');
  });

  it('retorna 0 quando o preço de venda é zero (evita divisão por zero)', () => {
    const margem = calcularMargemLucro(new Prisma.Decimal(10), new Prisma.Decimal(0));
    expect(margem.toString()).toBe('0');
  });

  it('arredonda em 4 casas decimais', () => {
    const margem = calcularMargemLucro(new Prisma.Decimal(1), new Prisma.Decimal(3));
    expect(margem.toString()).toBe('0.6667');
  });
});
