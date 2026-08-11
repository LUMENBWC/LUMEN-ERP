import { apiJson } from '@/lib/api/client';
import type { CriarCategoriaInput } from '../schemas/categoria.schema';
import type {
  CategoriaResumo,
  ListarCategoriasParams,
  ListarCategoriasResultado,
} from './categorias.types';

function buildQuery(params: ListarCategoriasParams): string {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('perPage', String(params.perPage));
  if (params.busca) search.set('busca', params.busca);
  if (params.ativo !== undefined) search.set('ativo', String(params.ativo));
  if (params.apenasRaiz !== undefined) search.set('apenasRaiz', String(params.apenasRaiz));
  if (params.sortBy) search.set('sortBy', params.sortBy);
  if (params.sortDir) search.set('sortDir', params.sortDir);
  return search.toString();
}

export const categoriasApi = {
  listar: (params: ListarCategoriasParams) =>
    apiJson<ListarCategoriasResultado>(`/categorias?${buildQuery(params)}`),
  obter: (id: string) => apiJson<CategoriaResumo>(`/categorias/${id}`),
  criar: (input: CriarCategoriaInput) =>
    apiJson<CategoriaResumo>('/categorias', { method: 'POST', body: JSON.stringify(input) }),
  atualizar: (id: string, input: Partial<CriarCategoriaInput>) =>
    apiJson<CategoriaResumo>(`/categorias/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  definirAtivo: (id: string, ativo: boolean) =>
    apiJson<CategoriaResumo>(`/categorias/${id}/ativo`, {
      method: 'PATCH',
      body: JSON.stringify({ ativo }),
    }),
};
