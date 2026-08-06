import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CriarUsuarioInput } from '../schemas/usuario.schema';
import { papeisApi, usuariosApi } from './usuarios.api';
import type { ListarUsuariosParams } from './usuarios.types';

const usuariosKeys = {
  all: ['usuarios'] as const,
  list: (params: ListarUsuariosParams) => [...usuariosKeys.all, 'list', params] as const,
  detail: (id: string) => [...usuariosKeys.all, 'detail', id] as const,
};

const papeisKeys = {
  list: ['papeis'] as const,
  permissoes: ['permissoes'] as const,
};

export function useUsuarios(params: ListarUsuariosParams) {
  return useQuery({
    queryKey: usuariosKeys.list(params),
    queryFn: () => usuariosApi.listar(params),
    placeholderData: (previous) => previous,
  });
}

export function useUsuario(id: string) {
  return useQuery({
    queryKey: usuariosKeys.detail(id),
    queryFn: () => usuariosApi.obter(id),
    enabled: !!id,
  });
}

export function usePapeis() {
  return useQuery({ queryKey: papeisKeys.list, queryFn: papeisApi.listar });
}

export function usePermissoes() {
  return useQuery({ queryKey: papeisKeys.permissoes, queryFn: papeisApi.listarPermissoes });
}

export function useCriarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarUsuarioInput) => usuariosApi.criar(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
      toast.success('Usuário criado com sucesso.');
    },
  });
}

export function useAtualizarUsuario(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { nome: string; email: string }) => usuariosApi.atualizar(id, input),
    onSuccess: (usuario) => {
      queryClient.setQueryData(usuariosKeys.detail(id), usuario);
      queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
      toast.success('Usuário atualizado com sucesso.');
    },
  });
}

export function useDefinirAtivo(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ativo: boolean) => usuariosApi.definirAtivo(id, ativo),
    onSuccess: (usuario) => {
      queryClient.setQueryData(usuariosKeys.detail(id), usuario);
      queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
    },
  });
}

export function useAtribuirPapel(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (papelId: string) => usuariosApi.atribuirPapel(id, papelId),
    onSuccess: (usuario) => {
      queryClient.setQueryData(usuariosKeys.detail(id), usuario);
      queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
      toast.success('Papel atribuído com sucesso.');
    },
  });
}

export function useRemoverPapel(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (papelId: string) => usuariosApi.removerPapel(id, papelId),
    onSuccess: (usuario) => {
      queryClient.setQueryData(usuariosKeys.detail(id), usuario);
      queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
      toast.success('Papel removido com sucesso.');
    },
  });
}
