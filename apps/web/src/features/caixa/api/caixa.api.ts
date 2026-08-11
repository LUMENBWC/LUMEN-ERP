import { apiJson } from '@/lib/api/client';
import type {
  CaixaSessaoDetalhada,
  CaixaSessaoResumo,
  ListarSessoesParams,
  ListarSessoesResultado,
} from './caixa.types';

function buildQuery(params: ListarSessoesParams): string {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('perPage', String(params.perPage));
  if (params.status) search.set('status', params.status);
  if (params.sortBy) search.set('sortBy', params.sortBy);
  if (params.sortDir) search.set('sortDir', params.sortDir);
  return search.toString();
}

export const caixaApi = {
  sessaoAtual: async () => {
    const { sessao } = await apiJson<{ sessao: CaixaSessaoResumo | null }>('/caixa/sessoes/atual');
    return sessao;
  },
  abrir: (valorAbertura: number) =>
    apiJson<CaixaSessaoResumo>('/caixa/abrir', {
      method: 'POST',
      body: JSON.stringify({ valorAbertura }),
    }),
  sangria: (valor: number, motivo: string) =>
    apiJson<void>('/caixa/sangria', { method: 'POST', body: JSON.stringify({ valor, motivo }) }),
  suprimento: (valor: number, motivo: string | null) =>
    apiJson<void>('/caixa/suprimento', {
      method: 'POST',
      body: JSON.stringify({ valor, motivo }),
    }),
  fechar: (valorFechamentoInformado: number, observacoes: string | null) =>
    apiJson<CaixaSessaoResumo>('/caixa/fechar', {
      method: 'POST',
      body: JSON.stringify({ valorFechamentoInformado, observacoes }),
    }),
  listarSessoes: (params: ListarSessoesParams) =>
    apiJson<ListarSessoesResultado>(`/caixa/sessoes?${buildQuery(params)}`),
  obterSessao: (id: string) => apiJson<CaixaSessaoDetalhada>(`/caixa/sessoes/${id}`),
};
