import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from './dashboard.api';
import type { PeriodoParams } from './dashboard.types';

const dashboardKeys = {
  resumo: (params: PeriodoParams) => ['dashboard', 'resumo', params] as const,
  produtosMaisVendidos: (params: PeriodoParams) =>
    ['dashboard', 'produtos-mais-vendidos', params] as const,
  fluxoCaixa: (params: PeriodoParams) => ['dashboard', 'fluxo-caixa', params] as const,
};

export function useResumoFinanceiro(params: PeriodoParams) {
  return useQuery({
    queryKey: dashboardKeys.resumo(params),
    queryFn: () => dashboardApi.obterResumo(params),
  });
}

export function useProdutosMaisVendidos(params: PeriodoParams) {
  return useQuery({
    queryKey: dashboardKeys.produtosMaisVendidos(params),
    queryFn: () => dashboardApi.obterProdutosMaisVendidos(params),
  });
}

export function useFluxoCaixa(params: PeriodoParams) {
  return useQuery({
    queryKey: dashboardKeys.fluxoCaixa(params),
    queryFn: () => dashboardApi.obterFluxoCaixa(params),
  });
}
