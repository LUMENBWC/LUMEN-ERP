import { apiJson } from '@/lib/api/client';
import type { CriarUsuarioInput } from '../schemas/usuario.schema';
import type {
  ListarUsuariosParams,
  ListarUsuariosResultado,
  PapelComPermissoes,
  PermissaoResumo,
  UsuarioDetalhado,
} from './usuarios.types';

function buildQuery(params: ListarUsuariosParams): string {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('perPage', String(params.perPage));
  if (params.busca) search.set('busca', params.busca);
  if (params.ativo !== undefined) search.set('ativo', String(params.ativo));
  if (params.papelId) search.set('papelId', params.papelId);
  if (params.sortBy) search.set('sortBy', params.sortBy);
  if (params.sortDir) search.set('sortDir', params.sortDir);
  return search.toString();
}

export const usuariosApi = {
  listar: (params: ListarUsuariosParams) =>
    apiJson<ListarUsuariosResultado>(`/usuarios?${buildQuery(params)}`),

  obter: (id: string) => apiJson<UsuarioDetalhado>(`/usuarios/${id}`),

  criar: (input: CriarUsuarioInput) =>
    apiJson<UsuarioDetalhado>('/usuarios', { method: 'POST', body: JSON.stringify(input) }),

  atualizar: (id: string, input: { nome: string; email: string }) =>
    apiJson<UsuarioDetalhado>(`/usuarios/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),

  definirAtivo: (id: string, ativo: boolean) =>
    apiJson<UsuarioDetalhado>(`/usuarios/${id}/ativo`, {
      method: 'PATCH',
      body: JSON.stringify({ ativo }),
    }),

  atribuirPapel: (id: string, papelId: string) =>
    apiJson<UsuarioDetalhado>(`/usuarios/${id}/papeis`, {
      method: 'POST',
      body: JSON.stringify({ papelId }),
    }),

  removerPapel: (id: string, papelId: string) =>
    apiJson<UsuarioDetalhado>(`/usuarios/${id}/papeis/${papelId}`, { method: 'DELETE' }),
};

export const papeisApi = {
  listar: () => apiJson<PapelComPermissoes[]>('/papeis'),
  listarPermissoes: () => apiJson<PermissaoResumo[]>('/permissoes'),
};
