import { apiJson } from '@/lib/api/client';
import type {
  RegistrarAjusteInput,
  RegistrarEntradaInput,
  RegistrarPerdaInput,
} from '../schemas/movimentacao.schema';
import type {
  ListarMovimentacoesParams,
  ListarMovimentacoesResultado,
  MovimentacaoResumo,
} from './estoque.types';

function buildQuery(params: ListarMovimentacoesParams): string {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('perPage', String(params.perPage));
  if (params.produtoId) search.set('produtoId', params.produtoId);
  if (params.fornecedorId) search.set('fornecedorId', params.fornecedorId);
  if (params.tipo) search.set('tipo', params.tipo);
  if (params.dataInicio) search.set('dataInicio', params.dataInicio);
  if (params.dataFim) search.set('dataFim', params.dataFim);
  if (params.sortBy) search.set('sortBy', params.sortBy);
  if (params.sortDir) search.set('sortDir', params.sortDir);
  return search.toString();
}

export const estoqueApi = {
  listarMovimentacoes: (params: ListarMovimentacoesParams) =>
    apiJson<ListarMovimentacoesResultado>(`/estoque/movimentacoes?${buildQuery(params)}`),
  registrarEntrada: (input: RegistrarEntradaInput) =>
    apiJson<MovimentacaoResumo>('/estoque/entradas', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  registrarAjuste: (input: RegistrarAjusteInput) =>
    apiJson<MovimentacaoResumo>('/estoque/ajustes', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  registrarPerda: (input: RegistrarPerdaInput) =>
    apiJson<MovimentacaoResumo>('/estoque/perdas', { method: 'POST', body: JSON.stringify(input) }),
};
