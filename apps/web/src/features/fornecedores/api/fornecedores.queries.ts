import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CriarFornecedorInput } from '../schemas/fornecedor.schema';
import { fornecedoresApi } from './fornecedores.api';
import type { ListarFornecedoresParams } from './fornecedores.types';

const fornecedoresKeys = {
  all: ['fornecedores'] as const,
  list: (params: ListarFornecedoresParams) => [...fornecedoresKeys.all, 'list', params] as const,
  detail: (id: string) => [...fornecedoresKeys.all, 'detail', id] as const,
};

export function useFornecedores(params: ListarFornecedoresParams) {
  return useQuery({
    queryKey: fornecedoresKeys.list(params),
    queryFn: () => fornecedoresApi.listar(params),
    placeholderData: (previous) => previous,
  });
}

export function useFornecedor(id: string) {
  return useQuery({
    queryKey: fornecedoresKeys.detail(id),
    queryFn: () => fornecedoresApi.obter(id),
    enabled: !!id,
  });
}

export function useCriarFornecedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarFornecedorInput) => fornecedoresApi.criar(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fornecedoresKeys.all });
      toast.success('Fornecedor criado com sucesso.');
    },
  });
}

export function useAtualizarFornecedor(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CriarFornecedorInput>) => fornecedoresApi.atualizar(id, input),
    onSuccess: (fornecedor) => {
      queryClient.setQueryData(fornecedoresKeys.detail(id), fornecedor);
      queryClient.invalidateQueries({ queryKey: fornecedoresKeys.all });
      toast.success('Fornecedor atualizado com sucesso.');
    },
  });
}

export function useDefinirAtivoFornecedor(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ativo: boolean) => fornecedoresApi.definirAtivo(id, ativo),
    onSuccess: (fornecedor) => {
      queryClient.setQueryData(fornecedoresKeys.detail(id), fornecedor);
      queryClient.invalidateQueries({ queryKey: fornecedoresKeys.all });
    },
  });
}

export function useVincularProduto(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (produtoId: string) => fornecedoresApi.vincularProduto(id, produtoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fornecedoresKeys.detail(id) });
      toast.success('Produto vinculado com sucesso.');
    },
  });
}

export function useDesvincularProduto(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (produtoId: string) => fornecedoresApi.desvincularProduto(id, produtoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fornecedoresKeys.detail(id) });
      toast.success('Produto desvinculado com sucesso.');
    },
  });
}
