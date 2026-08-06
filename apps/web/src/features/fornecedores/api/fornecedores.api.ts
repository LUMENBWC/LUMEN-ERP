import { apiJson } from '@/lib/api/client';
import type { CriarFornecedorInput } from '../schemas/fornecedor.schema';
import type {
  FornecedorDetalhado,
  ListarFornecedoresParams,
  ListarFornecedoresResultado,
} from './fornecedores.types';

function buildQuery(params: ListarFornecedoresParams): string {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('perPage', String(params.perPage));
  if (params.busca) search.set('busca', params.busca);
  if (params.tipoPessoa) search.set('tipoPessoa', params.tipoPessoa);
  if (params.ativo !== undefined) search.set('ativo', String(params.ativo));
  if (params.sortBy) search.set('sortBy', params.sortBy);
  if (params.sortDir) search.set('sortDir', params.sortDir);
  return search.toString();
}

export const fornecedoresApi = {
  listar: (params: ListarFornecedoresParams) =>
    apiJson<ListarFornecedoresResultado>(`/fornecedores?${buildQuery(params)}`),
  obter: (id: string) => apiJson<FornecedorDetalhado>(`/fornecedores/${id}`),
  criar: (input: CriarFornecedorInput) =>
    apiJson<FornecedorDetalhado>('/fornecedores', { method: 'POST', body: JSON.stringify(input) }),
  atualizar: (id: string, input: Partial<CriarFornecedorInput>) =>
    apiJson<FornecedorDetalhado>(`/fornecedores/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  definirAtivo: (id: string, ativo: boolean) =>
    apiJson<FornecedorDetalhado>(`/fornecedores/${id}/ativo`, {
      method: 'PATCH',
      body: JSON.stringify({ ativo }),
    }),
  vincularProduto: (id: string, produtoId: string) =>
    apiJson<void>(`/fornecedores/${id}/produtos`, {
      method: 'POST',
      body: JSON.stringify({ produtoId }),
    }),
  desvincularProduto: (id: string, produtoId: string) =>
    apiJson<void>(`/fornecedores/${id}/produtos/${produtoId}`, { method: 'DELETE' }),
};
