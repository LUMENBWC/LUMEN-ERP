import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from './dashboard.api';
import type { PeriodoParams } from './dashboard.types';

const dashboardKeys = {
  all: (params: PeriodoParams) => ['dashboard', params] as const,
};

/**
 * Carrega o dashboard financeiro inteiro (resumo, produtos mais vendidos e
 * fluxo de caixa) numa única requisição ao endpoint agregado `GET /dashboard`,
 * em vez de três chamadas HTTP separadas.
 */
export function useDashboard(params: PeriodoParams) {
  return useQuery({
    queryKey: dashboardKeys.all(params),
    queryFn: () => dashboardApi.obter(params),
    placeholderData: (previous) => previous,
  });
}
