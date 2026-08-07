import { Prisma } from '../../../../generated/prisma/client';
import { PagamentoDivergenteError } from './venda.errors';

/**
 * Regra crítica do PDV: a soma dos valores de todas as formas de pagamento
 * de uma venda tem que bater exatamente com o total da venda (spec Secao
 * 3.6, "pagamento dividido"). Sem essa checagem seria possível finalizar uma
 * venda recebendo mais ou menos do que o total.
 */
export function garantirPagamentosValidos(
  pagamentos: { valor: Prisma.Decimal }[],
  total: Prisma.Decimal,
): void {
  const soma = pagamentos.reduce(
    (acc, pagamento) => acc.plus(pagamento.valor),
    new Prisma.Decimal(0),
  );
  if (!soma.equals(total)) {
    throw new PagamentoDivergenteError();
  }
}
