import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { FormaPagamento } from '@/features/vendas/api/vendas.types';
import { financeiroApi } from './financeiro.api';
import type {
  CriarContaPagarInput,
  ListarContasPagarParams,
  ListarContasReceberParams,
} from './financeiro.types';

const financeiroKeys = {
  contasReceber: ['financeiro', 'contas-receber'] as const,
  contasReceberList: (params: ListarContasReceberParams) =>
    [...financeiroKeys.contasReceber, 'list', params] as const,
  contaReceberDetail: (id: string) => [...financeiroKeys.contasReceber, 'detail', id] as const,
  categoriasDespesa: ['financeiro', 'categorias-despesa'] as const,
  contasPagar: ['financeiro', 'contas-pagar'] as const,
  contasPagarList: (params: ListarContasPagarParams) =>
    [...financeiroKeys.contasPagar, 'list', params] as const,
  contaPagarDetail: (id: string) => [...financeiroKeys.contasPagar, 'detail', id] as const,
};

export function useContasReceber(params: ListarContasReceberParams) {
  return useQuery({
    queryKey: financeiroKeys.contasReceberList(params),
    queryFn: () => financeiroApi.listarContasReceber(params),
    placeholderData: (previous) => previous,
  });
}

export function useContaReceber(id: string) {
  return useQuery({
    queryKey: financeiroKeys.contaReceberDetail(id),
    queryFn: () => financeiroApi.obterContaReceber(id),
    enabled: !!id,
  });
}

export function useRegistrarRecebimento(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ valor, formaPagamento }: { valor: number; formaPagamento: FormaPagamento }) =>
      financeiroApi.registrarRecebimento(id, valor, formaPagamento),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeiroKeys.contasReceber });
      toast.success('Recebimento registrado.');
    },
  });
}

export function useCategoriasDespesa() {
  return useQuery({
    queryKey: financeiroKeys.categoriasDespesa,
    queryFn: financeiroApi.listarCategoriasDespesa,
  });
}

export function useCriarCategoriaDespesa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nome: string) => financeiroApi.criarCategoriaDespesa(nome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeiroKeys.categoriasDespesa });
      toast.success('Categoria de despesa criada.');
    },
  });
}

export function useContasPagar(params: ListarContasPagarParams) {
  return useQuery({
    queryKey: financeiroKeys.contasPagarList(params),
    queryFn: () => financeiroApi.listarContasPagar(params),
    placeholderData: (previous) => previous,
  });
}

export function useContaPagar(id: string) {
  return useQuery({
    queryKey: financeiroKeys.contaPagarDetail(id),
    queryFn: () => financeiroApi.obterContaPagar(id),
    enabled: !!id,
  });
}

export function useCriarContaPagar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarContaPagarInput) => financeiroApi.criarContaPagar(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeiroKeys.contasPagar });
      toast.success('Conta a pagar criada.');
    },
  });
}

export function useRegistrarPagamento(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (valor: number) => financeiroApi.registrarPagamento(id, valor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeiroKeys.contasPagar });
      toast.success('Pagamento registrado.');
    },
  });
}

export function useCancelarContaPagar(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => financeiroApi.cancelarContaPagar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeiroKeys.contasPagar });
      toast.success('Conta a pagar cancelada.');
    },
  });
}
