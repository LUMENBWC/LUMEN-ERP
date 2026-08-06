import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  RegistrarAjusteInput,
  RegistrarEntradaInput,
  RegistrarPerdaInput,
} from '../schemas/movimentacao.schema';
import { estoqueApi } from './estoque.api';
import type { ListarMovimentacoesParams } from './estoque.types';

const estoqueKeys = {
  all: ['estoque'] as const,
  movimentacoes: (params: ListarMovimentacoesParams) =>
    [...estoqueKeys.all, 'movimentacoes', params] as const,
};

export function useMovimentacoes(params: ListarMovimentacoesParams) {
  return useQuery({
    queryKey: estoqueKeys.movimentacoes(params),
    queryFn: () => estoqueApi.listarMovimentacoes(params),
    placeholderData: (previous) => previous,
  });
}

function useInvalidateEstoqueEProdutos() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: estoqueKeys.all });
    queryClient.invalidateQueries({ queryKey: ['produtos'] });
  };
}

export function useRegistrarEntrada() {
  const invalidate = useInvalidateEstoqueEProdutos();
  return useMutation({
    mutationFn: (input: RegistrarEntradaInput) => estoqueApi.registrarEntrada(input),
    onSuccess: () => {
      invalidate();
      toast.success('Entrada registrada com sucesso.');
    },
  });
}

export function useRegistrarAjuste() {
  const invalidate = useInvalidateEstoqueEProdutos();
  return useMutation({
    mutationFn: (input: RegistrarAjusteInput) => estoqueApi.registrarAjuste(input),
    onSuccess: () => {
      invalidate();
      toast.success('Ajuste registrado com sucesso.');
    },
  });
}

export function useRegistrarPerda() {
  const invalidate = useInvalidateEstoqueEProdutos();
  return useMutation({
    mutationFn: (input: RegistrarPerdaInput) => estoqueApi.registrarPerda(input),
    onSuccess: () => {
      invalidate();
      toast.success('Perda registrada com sucesso.');
    },
  });
}
