import { Prisma } from '../../../../generated/prisma/client';

export interface ParcelaCalculada {
  numero: number;
  total: number;
  valor: Prisma.Decimal;
  vencimento: Date;
}

const INTERVALO_DIAS_ENTRE_PARCELAS = 30;

/**
 * Divide o valor de um pagamento a prazo/parcelado em N parcelas com
 * vencimentos mensais (intervalo fixo de 30 dias) a partir de `dataVenda`.
 * A última parcela absorve o resto da divisão, pra soma das parcelas nunca
 * divergir do valor total (ver garantir-pagamentos-validos.ts).
 */
export function calcularParcelas(
  valorTotal: Prisma.Decimal,
  quantidadeParcelas: number,
  dataVenda: Date,
): ParcelaCalculada[] {
  const valorParcela = valorTotal
    .dividedBy(quantidadeParcelas)
    .toDecimalPlaces(2, Prisma.Decimal.ROUND_DOWN);

  const parcelas: ParcelaCalculada[] = [];
  let somaAlocada = new Prisma.Decimal(0);

  for (let indice = 0; indice < quantidadeParcelas; indice++) {
    const ehUltima = indice === quantidadeParcelas - 1;
    const valor = ehUltima ? valorTotal.minus(somaAlocada) : valorParcela;
    somaAlocada = somaAlocada.plus(valor);

    const vencimento = new Date(dataVenda);
    vencimento.setDate(vencimento.getDate() + (indice + 1) * INTERVALO_DIAS_ENTRE_PARCELAS);

    parcelas.push({ numero: indice + 1, total: quantidadeParcelas, valor, vencimento });
  }

  return parcelas;
}
