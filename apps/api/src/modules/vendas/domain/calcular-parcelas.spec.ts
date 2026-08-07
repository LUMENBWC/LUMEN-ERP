import { Prisma } from '../../../../generated/prisma/client';
import { calcularParcelas } from './calcular-parcelas';

describe('calcularParcelas', () => {
  const dataVenda = new Date('2026-01-01T12:00:00.000Z');

  it('gera uma única parcela igual ao valor total quando quantidadeParcelas é 1', () => {
    const parcelas = calcularParcelas(new Prisma.Decimal(100), 1, dataVenda);

    expect(parcelas).toHaveLength(1);
    expect(parcelas[0]!.valor.toNumber()).toBe(100);
    expect(parcelas[0]!.numero).toBe(1);
    expect(parcelas[0]!.total).toBe(1);
    expect(parcelas[0]!.vencimento.toISOString().slice(0, 10)).toBe('2026-01-31');
  });

  it('divide igualmente quando o valor é múltiplo da quantidade de parcelas', () => {
    const parcelas = calcularParcelas(new Prisma.Decimal(300), 3, dataVenda);

    expect(parcelas.map((p) => p.valor.toNumber())).toEqual([100, 100, 100]);
  });

  it('a última parcela absorve o resto da divisão, sem perder centavos', () => {
    const parcelas = calcularParcelas(new Prisma.Decimal(100), 3, dataVenda);

    const soma = parcelas.reduce((acc, p) => acc.plus(p.valor), new Prisma.Decimal(0));
    expect(soma.toNumber()).toBe(100);
    expect(parcelas.map((p) => p.valor.toNumber())).toEqual([33.33, 33.33, 33.34]);
  });

  it('espaça os vencimentos em intervalos de 30 dias a partir da data da venda', () => {
    const parcelas = calcularParcelas(new Prisma.Decimal(300), 3, dataVenda);

    expect(parcelas.map((p) => p.vencimento.toISOString().slice(0, 10))).toEqual([
      '2026-01-31',
      '2026-03-02',
      '2026-04-01',
    ]);
  });
});
