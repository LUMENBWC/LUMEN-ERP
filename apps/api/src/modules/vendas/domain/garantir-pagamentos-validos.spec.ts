import { Prisma } from '../../../../generated/prisma/client';
import { garantirPagamentosValidos } from './garantir-pagamentos-validos';
import { PagamentoDivergenteError } from './venda.errors';

describe('garantirPagamentosValidos', () => {
  it('aceita quando a soma dos pagamentos bate exatamente com o total', () => {
    expect(() =>
      garantirPagamentosValidos(
        [{ valor: new Prisma.Decimal(30) }, { valor: new Prisma.Decimal(70) }],
        new Prisma.Decimal(100),
      ),
    ).not.toThrow();
  });

  it('rejeita quando a soma é menor que o total', () => {
    expect(() =>
      garantirPagamentosValidos([{ valor: new Prisma.Decimal(50) }], new Prisma.Decimal(100)),
    ).toThrow(PagamentoDivergenteError);
  });

  it('rejeita quando a soma é maior que o total', () => {
    expect(() =>
      garantirPagamentosValidos([{ valor: new Prisma.Decimal(150) }], new Prisma.Decimal(100)),
    ).toThrow(PagamentoDivergenteError);
  });

  it('rejeita lista de pagamentos vazia contra um total maior que zero', () => {
    expect(() => garantirPagamentosValidos([], new Prisma.Decimal(100))).toThrow(
      PagamentoDivergenteError,
    );
  });
});
