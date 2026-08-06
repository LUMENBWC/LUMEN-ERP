import { apiJson } from '@/lib/api/client';
import type { CriarProdutoInput } from '../schemas/produto.schema';
import type {
  ListarProdutosParams,
  ListarProdutosResultado,
  ProdutoDetalhado,
  ProdutoResumo,
} from './produtos.types';

function buildQuery(params: ListarProdutosParams): string {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('perPage', String(params.perPage));
  if (params.busca) search.set('busca', params.busca);
  if (params.categoriaId) search.set('categoriaId', params.categoriaId);
  if (params.ativo !== undefined) search.set('ativo', String(params.ativo));
  if (params.abaixoDoMinimo !== undefined)
    search.set('abaixoDoMinimo', String(params.abaixoDoMinimo));
  if (params.sortBy) search.set('sortBy', params.sortBy);
  if (params.sortDir) search.set('sortDir', params.sortDir);
  return search.toString();
}

export const produtosApi = {
  listar: (params: ListarProdutosParams) =>
    apiJson<ListarProdutosResultado>(`/produtos?${buildQuery(params)}`),
  obter: (id: string) => apiJson<ProdutoDetalhado>(`/produtos/${id}`),
  alertasEstoqueMinimo: () => apiJson<ProdutoResumo[]>('/produtos/alertas/estoque-minimo'),
  criar: (input: CriarProdutoInput) =>
    apiJson<ProdutoDetalhado>('/produtos', { method: 'POST', body: JSON.stringify(input) }),
  atualizar: (id: string, input: Partial<CriarProdutoInput>) =>
    apiJson<ProdutoDetalhado>(`/produtos/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  definirAtivo: (id: string, ativo: boolean) =>
    apiJson<ProdutoDetalhado>(`/produtos/${id}/ativo`, {
      method: 'PATCH',
      body: JSON.stringify({ ativo }),
    }),
};
