import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CriarOrcamentoInput } from '../schemas/orcamento.schema';
import { orcamentosApi } from './orcamentos.api';
import type { ListarOrcamentosParams, StatusOrcamento } from './orcamentos.types';

const orcamentosKeys = {
  all: ['orcamentos'] as const,
  list: (params: ListarOrcamentosParams) => [...orcamentosKeys.all, 'list', params] as const,
  detail: (id: string) => [...orcamentosKeys.all, 'detail', id] as const,
};

export function useOrcamentos(params: ListarOrcamentosParams) {
  return useQuery({
    queryKey: orcamentosKeys.list(params),
    queryFn: () => orcamentosApi.listar(params),
    placeholderData: (previous) => previous,
  });
}

export function useOrcamento(id: string) {
  return useQuery({
    queryKey: orcamentosKeys.detail(id),
    queryFn: () => orcamentosApi.obter(id),
    enabled: !!id,
  });
}

export function useCriarOrcamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarOrcamentoInput) => orcamentosApi.criar(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orcamentosKeys.all });
      toast.success('Orçamento criado com sucesso.');
    },
  });
}

export function useAtualizarOrcamento(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarOrcamentoInput) => orcamentosApi.atualizar(id, input),
    onSuccess: (orcamento) => {
      queryClient.setQueryData(orcamentosKeys.detail(id), orcamento);
      queryClient.invalidateQueries({ queryKey: orcamentosKeys.all });
      toast.success('Orçamento atualizado com sucesso.');
    },
  });
}

export function useAtualizarStatusOrcamento(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: StatusOrcamento) => orcamentosApi.atualizarStatus(id, status),
    onSuccess: (orcamento) => {
      queryClient.setQueryData(orcamentosKeys.detail(id), orcamento);
      queryClient.invalidateQueries({ queryKey: orcamentosKeys.all });
      toast.success('Status do orçamento atualizado.');
    },
  });
}

export function useCancelarOrcamento(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => orcamentosApi.cancelar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orcamentosKeys.all });
      toast.success('Orçamento cancelado.');
    },
  });
}

export function useGerarPdfOrcamento(id: string) {
  return useMutation({
    mutationFn: () => orcamentosApi.gerarPdf(id),
    onError: () => {
      toast.error('Não foi possível gerar o PDF do orçamento.');
    },
  });
}
