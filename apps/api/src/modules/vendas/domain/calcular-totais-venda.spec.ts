import { Prisma } from '../../../../generated/prisma/client';
import { calcularTotaisVenda } from './calcular-totais-venda';

function item(
  overrides: Partial<{
    quantidade: number;
    precoUnitario: number;
    desconto: number;
    custoUnitario: number;
  }> = {},
) {
  return {
    produtoId: 'produto-1',
    quantidade: new Prisma.Decimal(overrides.quantidade ?? 1),
    precoUnitario: new Prisma.Decimal(overrides.precoUnitario ?? 10),
    desconto: new Prisma.Decimal(overrides.desconto ?? 0),
    custoUnitario: new Prisma.Decimal(overrides.custoUnitario ?? 5),
  };
}

describe('calcularTotaisVenda', () => {
  it('calcula total por item, subtotal, total e custo total sem descontos', () => {
    const resultado = calcularTotaisVenda(
      [item({ quantidade: 2, precoUnitario: 10, custoUnitario: 5 })],
      new Prisma.Decimal(0),
    );

    expect(resultado.itens[0]!.total.toNumber()).toBe(20);
    expect(resultado.subtotal.toNumber()).toBe(20);
    expect(resultado.total.toNumber()).toBe(20);
    expect(resultado.custoTotal.toNumber()).toBe(10);
  });

  it('aplica desconto por item e desconto geral', () => {
    const resultado = calcularTotaisVenda(
      [
        item({ quantidade: 2, precoUnitario: 10, desconto: 2 }),
        item({ quantidade: 1, precoUnitario: 5, desconto: 0 }),
      ],
      new Prisma.Decimal(3),
    );

    expect(resultado.subtotal.toNumber()).toBe(23);
    expect(resultado.total.toNumber()).toBe(20);
  });

  it('nunca deixa o total ficar negativo mesmo com desconto geral maior que o subtotal', () => {
    const resultado = calcularTotaisVenda(
      [item({ quantidade: 1, precoUnitario: 10 })],
      new Prisma.Decimal(999),
    );

    expect(resultado.total.toNumber()).toBe(0);
  });

  it('soma o custo total ponderado pela quantidade de cada item', () => {
    const resultado = calcularTotaisVenda(
      [item({ quantidade: 3, custoUnitario: 4 }), item({ quantidade: 2, custoUnitario: 1.5 })],
      new Prisma.Decimal(0),
    );

    expect(resultado.custoTotal.toNumber()).toBe(15);
  });
});
