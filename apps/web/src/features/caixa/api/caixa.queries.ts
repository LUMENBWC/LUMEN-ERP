import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { caixaApi } from './caixa.api';
import type { ListarSessoesParams } from './caixa.types';

const caixaKeys = {
  sessaoAtual: ['caixa', 'sessao-atual'] as const,
  sessoes: ['caixa', 'sessoes'] as const,
  sessoesList: (params: ListarSessoesParams) => [...caixaKeys.sessoes, 'list', params] as const,
  sessaoDetail: (id: string) => [...caixaKeys.sessoes, 'detail', id] as const,
};

export function useCaixaAtual() {
  return useQuery({
    queryKey: caixaKeys.sessaoAtual,
    queryFn: caixaApi.sessaoAtual,
  });
}

export function useSessoesCaixa(params: ListarSessoesParams) {
  return useQuery({
    queryKey: caixaKeys.sessoesList(params),
    queryFn: () => caixaApi.listarSessoes(params),
    placeholderData: (previous) => previous,
  });
}

export function useSessaoCaixa(id: string) {
  return useQuery({
    queryKey: caixaKeys.sessaoDetail(id),
    queryFn: () => caixaApi.obterSessao(id),
    enabled: !!id,
  });
}

export function useAbrirCaixa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (valorAbertura: number) => caixaApi.abrir(valorAbertura),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caixaKeys.sessaoAtual });
      queryClient.invalidateQueries({ queryKey: caixaKeys.sessoes });
      toast.success('Caixa aberto.');
    },
  });
}

export function useRegistrarSangria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ valor, motivo }: { valor: number; motivo: string }) =>
      caixaApi.sangria(valor, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caixaKeys.sessoes });
      toast.success('Sangria registrada.');
    },
  });
}

export function useRegistrarSuprimento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ valor, motivo }: { valor: number; motivo: string | null }) =>
      caixaApi.suprimento(valor, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caixaKeys.sessoes });
      toast.success('Suprimento registrado.');
    },
  });
}

export function useFecharCaixa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      valorFechamentoInformado,
      observacoes,
    }: {
      valorFechamentoInformado: number;
      observacoes: string | null;
    }) => caixaApi.fechar(valorFechamentoInformado, observacoes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caixaKeys.sessaoAtual });
      queryClient.invalidateQueries({ queryKey: caixaKeys.sessoes });
      toast.success('Caixa fechado.');
    },
  });
}
