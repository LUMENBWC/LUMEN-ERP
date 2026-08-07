import { Prisma } from '../../../../generated/prisma/client';
import { calcularValorEsperado } from './calcular-valor-esperado';

function movimento(tipo: string, valor: number) {
  return { tipo: tipo as never, valor: new Prisma.Decimal(valor) };
}

describe('calcularValorEsperado', () => {
  it('soma abertura, suprimentos e vendas em dinheiro', () => {
    const valor = calcularValorEsperado([
      movimento('ABERTURA', 100),
      movimento('SUPRIMENTO', 50),
      movimento('VENDA', 30),
    ]);

    expect(valor.toNumber()).toBe(180);
  });

  it('subtrai sangrias', () => {
    const valor = calcularValorEsperado([movimento('ABERTURA', 100), movimento('SANGRIA', 40)]);

    expect(valor.toNumber()).toBe(60);
  });

  it('ignora o movimento de fechamento no cálculo', () => {
    const valor = calcularValorEsperado([
      movimento('ABERTURA', 100),
      movimento('VENDA', 20),
      movimento('FECHAMENTO', 120),
    ]);

    expect(valor.toNumber()).toBe(120);
  });

  it('retorna zero para uma lista vazia', () => {
    expect(calcularValorEsperado([]).toNumber()).toBe(0);
  });
});
