import { Prisma } from '../../../../generated/prisma/client';
import { calcularSaldoAposDelta } from './calcular-saldo-apos-delta';
import { EstoqueInsuficienteError } from './estoque.errors';

describe('calcularSaldoAposDelta', () => {
  it('soma um delta positivo ao estoque atual', () => {
    const saldo = calcularSaldoAposDelta(new Prisma.Decimal(10), new Prisma.Decimal(5), false);
    expect(saldo.toString()).toBe('15');
  });

  it('permite um delta negativo que ainda mantém o saldo não-negativo', () => {
    const saldo = calcularSaldoAposDelta(new Prisma.Decimal(10), new Prisma.Decimal(-4), false);
    expect(saldo.toString()).toBe('6');
  });

  it('lança EstoqueInsuficienteError quando o saldo ficaria negativo sem permissão', () => {
    expect(() =>
      calcularSaldoAposDelta(new Prisma.Decimal(3), new Prisma.Decimal(-5), false),
    ).toThrow(EstoqueInsuficienteError);
  });

  it('permite o saldo negativo quando a permissão explícita é concedida', () => {
    const saldo = calcularSaldoAposDelta(new Prisma.Decimal(3), new Prisma.Decimal(-5), true);
    expect(saldo.toString()).toBe('-2');
  });

  it('permite o saldo chegar exatamente a zero sem precisar de permissão', () => {
    const saldo = calcularSaldoAposDelta(new Prisma.Decimal(5), new Prisma.Decimal(-5), false);
    expect(saldo.toString()).toBe('0');
  });
});
