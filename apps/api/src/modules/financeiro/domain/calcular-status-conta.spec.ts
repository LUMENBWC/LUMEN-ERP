import { Prisma } from '../../../../generated/prisma/client';
import { calcularStatusConta } from './calcular-status-conta';

describe('calcularStatusConta', () => {
  it('retorna ABERTO quando nada foi lançado ainda', () => {
    expect(calcularStatusConta(new Prisma.Decimal(100), new Prisma.Decimal(0))).toBe('ABERTO');
  });

  it('retorna PARCIAL quando o valor lançado é maior que zero e menor que o total', () => {
    expect(calcularStatusConta(new Prisma.Decimal(100), new Prisma.Decimal(40))).toBe('PARCIAL');
  });

  it('retorna PAGO quando o valor lançado é igual ao total', () => {
    expect(calcularStatusConta(new Prisma.Decimal(100), new Prisma.Decimal(100))).toBe('PAGO');
  });

  it('retorna PAGO quando o valor lançado supera o total (não deveria acontecer, mas não trava)', () => {
    expect(calcularStatusConta(new Prisma.Decimal(100), new Prisma.Decimal(150))).toBe('PAGO');
  });
});
