import { apiJson } from '@/lib/api/client';
import type { CaixaSessaoResumo } from './caixa.types';

export const caixaApi = {
  sessaoAtual: async () => {
    const { sessao } = await apiJson<{ sessao: CaixaSessaoResumo | null }>('/caixa/sessoes/atual');
    return sessao;
  },
  abrir: (valorAbertura: number) =>
    apiJson<CaixaSessaoResumo>('/caixa/abrir', {
      method: 'POST',
      body: JSON.stringify({ valorAbertura }),
    }),
};
