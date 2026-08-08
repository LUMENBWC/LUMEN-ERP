import type { StatusContaBase } from './calcular-status-conta';

/**
 * "Vencida" é sempre calculado, nunca armazenado - não existe job/cron nesse
 * projeto pra transicionar o `status` da conta pra `VENCIDO` no banco no dia
 * seguinte ao vencimento. Uma conta `ABERTO`/`PARCIAL` cujo vencimento já
 * passou é considerada vencida nas listagens/telas, mas o valor persistido
 * de `status` continua `ABERTO`/`PARCIAL` até ser paga ou cancelada - é
 * sempre possível receber/pagar uma conta vencida.
 */
export function estaVencida(vencimento: Date, status: StatusContaBase, hoje: Date): boolean {
  if (status === 'PAGO') return false;
  return vencimento.getTime() < hoje.getTime();
}
