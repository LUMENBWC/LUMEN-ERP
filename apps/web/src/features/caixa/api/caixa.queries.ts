import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { caixaApi } from './caixa.api';

const caixaKeys = {
  sessaoAtual: ['caixa', 'sessao-atual'] as const,
};

export function useCaixaAtual() {
  return useQuery({
    queryKey: caixaKeys.sessaoAtual,
    queryFn: caixaApi.sessaoAtual,
  });
}

export function useAbrirCaixa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (valorAbertura: number) => caixaApi.abrir(valorAbertura),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caixaKeys.sessaoAtual });
      toast.success('Caixa aberto.');
    },
  });
}
