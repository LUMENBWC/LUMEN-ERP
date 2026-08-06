import { apiJson } from '@/lib/api/client';
import type { CriarClienteInput } from '../schemas/cliente.schema';
import type {
  ClienteDetalhado,
  ListarClientesParams,
  ListarClientesResultado,
} from './clientes.types';

function buildQuery(params: ListarClientesParams): string {
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

export const clientesApi = {
  listar: (params: ListarClientesParams) =>
    apiJson<ListarClientesResultado>(`/clientes?${buildQuery(params)}`),
  obter: (id: string) => apiJson<ClienteDetalhado>(`/clientes/${id}`),
  criar: (input: CriarClienteInput) =>
    apiJson<ClienteDetalhado>('/clientes', { method: 'POST', body: JSON.stringify(input) }),
  atualizar: (id: string, input: Partial<CriarClienteInput>) =>
    apiJson<ClienteDetalhado>(`/clientes/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  definirAtivo: (id: string, ativo: boolean) =>
    apiJson<ClienteDetalhado>(`/clientes/${id}/ativo`, {
      method: 'PATCH',
      body: JSON.stringify({ ativo }),
    }),
};
