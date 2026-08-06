import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CriarProdutoInput } from '../schemas/produto.schema';
import { produtosApi } from './produtos.api';
import type { ListarProdutosParams } from './produtos.types';

const produtosKeys = {
  all: ['produtos'] as const,
  list: (params: ListarProdutosParams) => [...produtosKeys.all, 'list', params] as const,
  detail: (id: string) => [...produtosKeys.all, 'detail', id] as const,
  alertas: ['produtos', 'alertas-estoque-minimo'] as const,
};

export function useProdutos(params: ListarProdutosParams) {
  return useQuery({
    queryKey: produtosKeys.list(params),
    queryFn: () => produtosApi.listar(params),
    placeholderData: (previous) => previous,
  });
}

export function useProduto(id: string) {
  return useQuery({
    queryKey: produtosKeys.detail(id),
    queryFn: () => produtosApi.obter(id),
    enabled: !!id,
  });
}

export function useAlertasEstoqueMinimo() {
  return useQuery({ queryKey: produtosKeys.alertas, queryFn: produtosApi.alertasEstoqueMinimo });
}

export function useCriarProduto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarProdutoInput) => produtosApi.criar(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: produtosKeys.all });
      toast.success('Produto criado com sucesso.');
    },
  });
}

export function useAtualizarProduto(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CriarProdutoInput>) => produtosApi.atualizar(id, input),
    onSuccess: (produto) => {
      queryClient.setQueryData(produtosKeys.detail(id), produto);
      queryClient.invalidateQueries({ queryKey: produtosKeys.all });
      toast.success('Produto atualizado com sucesso.');
    },
  });
}

export function useDefinirAtivoProduto(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ativo: boolean) => produtosApi.definirAtivo(id, ativo),
    onSuccess: (produto) => {
      queryClient.setQueryData(produtosKeys.detail(id), produto);
      queryClient.invalidateQueries({ queryKey: produtosKeys.all });
    },
  });
}
