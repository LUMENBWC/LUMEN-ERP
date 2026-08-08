import { Prisma } from '../../../../generated/prisma/client';

export type StatusContaBase = 'ABERTO' | 'PARCIAL' | 'PAGO';

/**
 * Status de uma conta (a receber ou a pagar) a partir do quanto já foi
 * lançado contra o valor total - mesma regra pras duas, reaproveitada em vez
 * de duplicada entre `contas_receber` e `contas_pagar`. Nunca retorna
 * `VENCIDO`/`CANCELADO` - isso não é responsabilidade desse cálculo (ver
 * `estaVencida.ts` e os use-cases de cancelamento).
 */
export function calcularStatusConta(
  valorTotal: Prisma.Decimal,
  valorAcumulado: Prisma.Decimal,
): StatusContaBase {
  if (valorAcumulado.greaterThanOrEqualTo(valorTotal)) return 'PAGO';
  if (valorAcumulado.greaterThan(0)) return 'PARCIAL';
  return 'ABERTO';
}
