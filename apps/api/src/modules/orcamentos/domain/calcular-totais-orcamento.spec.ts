import { Prisma } from '../../../../generated/prisma/client';
import { calcularTotaisOrcamento } from './calcular-totais-orcamento';

describe('calcularTotaisOrcamento', () => {
  it('calcula o total de cada item e o subtotal do orçamento', () => {
    const resultado = calcularTotaisOrcamento(
      [
        {
          quantidade: new Prisma.Decimal(2),
          precoUnitario: new Prisma.Decimal(10),
          desconto: new Prisma.Decimal(0),
        },
        {
          quantidade: new Prisma.Decimal(1),
          precoUnitario: new Prisma.Decimal(50),
          desconto: new Prisma.Decimal(5),
        },
      ],
      new Prisma.Decimal(0),
    );

    expect(resultado.itens[0]!.total.toString()).toBe('20');
    expect(resultado.itens[1]!.total.toString()).toBe('45');
    expect(resultado.subtotal.toString()).toBe('65');
    expect(resultado.total.toString()).toBe('65');
  });

  it('aplica o desconto geral sobre o subtotal', () => {
    const resultado = calcularTotaisOrcamento(
      [
        {
          quantidade: new Prisma.Decimal(1),
          precoUnitario: new Prisma.Decimal(100),
          desconto: new Prisma.Decimal(0),
        },
      ],
      new Prisma.Decimal(30),
    );

    expect(resultado.subtotal.toString()).toBe('100');
    expect(resultado.total.toString()).toBe('70');
  });

  it('nunca deixa o total ficar negativo mesmo com desconto geral maior que o subtotal', () => {
    const resultado = calcularTotaisOrcamento(
      [
        {
          quantidade: new Prisma.Decimal(1),
          precoUnitario: new Prisma.Decimal(10),
          desconto: new Prisma.Decimal(0),
        },
      ],
      new Prisma.Decimal(999),
    );

    expect(resultado.total.toString()).toBe('0');
  });

  it('retorna subtotal e total zero para orçamento sem itens', () => {
    const resultado = calcularTotaisOrcamento([], new Prisma.Decimal(0));

    expect(resultado.subtotal.toString()).toBe('0');
    expect(resultado.total.toString()).toBe('0');
  });
});
