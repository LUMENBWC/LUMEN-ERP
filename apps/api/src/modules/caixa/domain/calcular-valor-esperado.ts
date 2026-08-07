import { Prisma } from '../../../../generated/prisma/client';
import type { TipoMovimentoCaixaValue } from '../application/ports/caixa.repository.port';

export interface MovimentoParaCalculo {
  tipo: TipoMovimentoCaixaValue;
  valor: Prisma.Decimal;
}

/**
 * Valor esperado em caixa: abertura + suprimentos + vendas em dinheiro,
 * menos sangrias. O movimento FECHAMENTO em si nunca entra na conta - ele é
 * o registro *resultante* do fechamento, não uma entrada/saída de dinheiro.
 */
export function calcularValorEsperado(movimentos: MovimentoParaCalculo[]): Prisma.Decimal {
  return movimentos.reduce((acc, movimento) => {
    if (movimento.tipo === 'FECHAMENTO') return acc;
    if (movimento.tipo === 'SANGRIA') return acc.minus(movimento.valor);
    return acc.plus(movimento.valor);
  }, new Prisma.Decimal(0));
}
