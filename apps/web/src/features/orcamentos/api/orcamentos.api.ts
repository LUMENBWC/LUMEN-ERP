import { apiJson } from '@/lib/api/client';
import type { CriarOrcamentoInput } from '../schemas/orcamento.schema';
import type {
  ListarOrcamentosParams,
  ListarOrcamentosResultado,
  OrcamentoDetalhado,
  StatusOrcamento,
} from './orcamentos.types';

function buildQuery(params: ListarOrcamentosParams): string {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('perPage', String(params.perPage));
  if (params.clienteId) search.set('clienteId', params.clienteId);
  if (params.status) search.set('status', params.status);
  if (params.sortBy) search.set('sortBy', params.sortBy);
  if (params.sortDir) search.set('sortDir', params.sortDir);
  return search.toString();
}

export const orcamentosApi = {
  listar: (params: ListarOrcamentosParams) =>
    apiJson<ListarOrcamentosResultado>(`/orcamentos?${buildQuery(params)}`),
  obter: (id: string) => apiJson<OrcamentoDetalhado>(`/orcamentos/${id}`),
  criar: (input: CriarOrcamentoInput) =>
    apiJson<OrcamentoDetalhado>('/orcamentos', { method: 'POST', body: JSON.stringify(input) }),
  atualizar: (id: string, input: CriarOrcamentoInput) =>
    apiJson<OrcamentoDetalhado>(`/orcamentos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  atualizarStatus: (id: string, status: StatusOrcamento) =>
    apiJson<OrcamentoDetalhado>(`/orcamentos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  cancelar: (id: string) => apiJson<void>(`/orcamentos/${id}/cancelar`, { method: 'POST' }),
  gerarPdf: (id: string) => apiJson<{ url: string }>(`/orcamentos/${id}/pdf`, { method: 'POST' }),
};
