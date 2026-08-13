/**
 * Formatação de valores para exibição (pt-BR).
 *
 * Por que isto é necessário e não cosmético: a API devolve todo valor
 * monetário como string, serializada por `Prisma.Decimal` (decimal.js), cujo
 * `toJSON()` é o `toString()` - e esse normaliza a escala, removendo zeros à
 * direita. Uma coluna `Decimal(14,2)` que vale 1234.50 no banco chega no
 * front como "1234.5", e 10.00 chega como "10". Interpolar isso direto na UI
 * (`R$ {valor}`) renderiza "R$ 1234.5" e "R$ 10".
 *
 * Toda exibição de dinheiro, percentual, data e quantidade deve passar por
 * aqui - nunca interpolar o valor cru da API.
 */

const MOEDA = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const PERCENTUAL = new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1 });
const DATA = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });
const DATA_HORA = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

/** `"1234.5"` → `"R$ 1.234,50"`. */
export function formatarMoeda(valor: string | number | null | undefined): string {
  const numero = Number(valor ?? 0);
  return MOEDA.format(Number.isFinite(numero) ? numero : 0);
}

/**
 * `"0.4"` → `"40,0%"`. Recebe a fração como a API devolve (`margemLucro` é
 * `Decimal(7,4)`, ou seja 0.4 = 40%), não o número já multiplicado por 100.
 */
export function formatarPercentual(valor: string | number | null | undefined): string {
  const numero = Number(valor ?? 0);
  return PERCENTUAL.format(Number.isFinite(numero) ? numero : 0);
}

/** ISO → `"12/08/2026"`. */
export function formatarData(iso: string | null | undefined): string {
  if (!iso) return '—';
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? '—' : DATA.format(data);
}

/** ISO → `"12/08/2026 20:13"`. */
export function formatarDataHora(iso: string | null | undefined): string {
  if (!iso) return '—';
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? '—' : DATA_HORA.format(data);
}

/**
 * `"12.000"` → `"12"`; `"1.5"` → `"1,5"`. Quantidades são `Decimal(14,3)` e
 * sofrem a mesma normalização de escala do dinheiro. Até 3 casas, sem forçar
 * zeros à direita.
 */
export function formatarQuantidade(valor: string | number | null | undefined): string {
  const numero = Number(valor ?? 0);
  if (!Number.isFinite(numero)) return '0';
  return numero.toLocaleString('pt-BR', { maximumFractionDigits: 3 });
}

/** Valor com sinal explícito, para movimentos de caixa e ajustes de estoque. */
export function formatarMoedaComSinal(valor: string | number | null | undefined): string {
  const numero = Number(valor ?? 0);
  const seguro = Number.isFinite(numero) ? numero : 0;
  return `${seguro > 0 ? '+' : seguro < 0 ? '−' : ''}${MOEDA.format(Math.abs(seguro))}`;
}
