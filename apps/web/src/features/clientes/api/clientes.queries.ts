import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CriarClienteInput } from '../schemas/cliente.schema';
import { clientesApi } from './clientes.api';
import type { ListarClientesParams } from './clientes.types';

const clientesKeys = {
  all: ['clientes'] as const,
  list: (params: ListarClientesParams) => [...clientesKeys.all, 'list', params] as const,
  detail: (id: string) => [...clientesKeys.all, 'detail', id] as const,
};

export function useClientes(params: ListarClientesParams) {
  return useQuery({
    queryKey: clientesKeys.list(params),
    queryFn: () => clientesApi.listar(params),
    placeholderData: (previous) => previous,
  });
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: clientesKeys.detail(id),
    queryFn: () => clientesApi.obter(id),
    enabled: !!id,
  });
}

export function useCriarCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarClienteInput) => clientesApi.criar(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientesKeys.all });
      toast.success('Cliente criado com sucesso.');
    },
  });
}

export function useAtualizarCliente(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CriarClienteInput>) => clientesApi.atualizar(id, input),
    onSuccess: (cliente) => {
      queryClient.setQueryData(clientesKeys.detail(id), cliente);
      queryClient.invalidateQueries({ queryKey: clientesKeys.all });
      toast.success('Cliente atualizado com sucesso.');
    },
  });
}

export function useDefinirAtivoCliente(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ativo: boolean) => clientesApi.definirAtivo(id, ativo),
    onSuccess: (cliente) => {
      queryClient.setQueryData(clientesKeys.detail(id), cliente);
      queryClient.invalidateQueries({ queryKey: clientesKeys.all });
    },
  });
}
