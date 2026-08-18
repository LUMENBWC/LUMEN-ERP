import { apiJson } from '@/lib/api/client';
import type {
  DashboardResultado,
  FluxoCaixaResultado,
  PeriodoParams,
  ProdutosMaisVendidosResultado,
  ResumoFinanceiro,
} from './dashboard.types';

function buildQuery(params: PeriodoParams): string {
  const search = new URLSearchParams();
  if (params.dataInicio) search.set('dataInicio', params.dataInicio);
  if (params.dataFim) search.set('dataFim', params.dataFim);
  return search.toString();
}

export const dashboardApi = {
  obter: (params: PeriodoParams) => apiJson<DashboardResultado>(`/dashboard?${buildQuery(params)}`),
  obterResumo: (params: PeriodoParams) =>
    apiJson<ResumoFinanceiro>(`/dashboard/resumo?${buildQuery(params)}`),
  obterProdutosMaisVendidos: (params: PeriodoParams) =>
    apiJson<ProdutosMaisVendidosResultado>(
      `/dashboard/produtos-mais-vendidos?${buildQuery(params)}`,
    ),
  obterFluxoCaixa: (params: PeriodoParams) =>
    apiJson<FluxoCaixaResultado>(`/dashboard/fluxo-caixa?${buildQuery(params)}`),
};
