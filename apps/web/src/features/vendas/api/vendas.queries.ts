import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { FinalizarVendaInput, ListarVendasParams } from './vendas.types';
import { vendasApi } from './vendas.api';

const vendasKeys = {
  all: ['vendas'] as const,
  list: (params: ListarVendasParams) => [...vendasKeys.all, 'list', params] as const,
  detail: (id: string) => [...vendasKeys.all, 'detail', id] as const,
};

export function useVendas(params: ListarVendasParams) {
  return useQuery({
    queryKey: vendasKeys.list(params),
    queryFn: () => vendasApi.listar(params),
    placeholderData: (previous) => previous,
  });
}

export function useVenda(id: string) {
  return useQuery({
    queryKey: vendasKeys.detail(id),
    queryFn: () => vendasApi.obter(id),
    enabled: !!id,
  });
}

export function useFinalizarVenda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: FinalizarVendaInput) => vendasApi.finalizar(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendasKeys.all });
      toast.success('Venda finalizada com sucesso.');
    },
  });
}

export function useCancelarVenda(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => vendasApi.cancelar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendasKeys.all });
      toast.success('Venda cancelada.');
    },
  });
}
