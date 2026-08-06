import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CriarCategoriaInput } from '../schemas/categoria.schema';
import { categoriasApi } from './categorias.api';
import type { ListarCategoriasParams } from './categorias.types';

const categoriasKeys = {
  all: ['categorias'] as const,
  list: (params: ListarCategoriasParams) => [...categoriasKeys.all, 'list', params] as const,
  detail: (id: string) => [...categoriasKeys.all, 'detail', id] as const,
};

export function useCategorias(params: ListarCategoriasParams) {
  return useQuery({
    queryKey: categoriasKeys.list(params),
    queryFn: () => categoriasApi.listar(params),
    placeholderData: (previous) => previous,
  });
}

export function useCategoria(id: string) {
  return useQuery({
    queryKey: categoriasKeys.detail(id),
    queryFn: () => categoriasApi.obter(id),
    enabled: !!id,
  });
}

export function useCriarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarCategoriaInput) => categoriasApi.criar(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriasKeys.all });
      toast.success('Categoria criada com sucesso.');
    },
  });
}

export function useAtualizarCategoria(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CriarCategoriaInput>) => categoriasApi.atualizar(id, input),
    onSuccess: (categoria) => {
      queryClient.setQueryData(categoriasKeys.detail(id), categoria);
      queryClient.invalidateQueries({ queryKey: categoriasKeys.all });
      toast.success('Categoria atualizada com sucesso.');
    },
  });
}

export function useDefinirAtivoCategoria(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ativo: boolean) => categoriasApi.definirAtivo(id, ativo),
    onSuccess: (categoria) => {
      queryClient.setQueryData(categoriasKeys.detail(id), categoria);
      queryClient.invalidateQueries({ queryKey: categoriasKeys.all });
    },
  });
}
