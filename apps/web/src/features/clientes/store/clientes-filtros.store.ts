import { create } from 'zustand';
import type { TipoPessoa } from '../api/clientes.types';

interface ClientesFiltrosState {
  busca: string;
  ativo: boolean | undefined;
  tipoPessoa: TipoPessoa | undefined;
  page: number;
  setBusca: (busca: string) => void;
  setAtivo: (ativo: boolean | undefined) => void;
  setTipoPessoa: (tipoPessoa: TipoPessoa | undefined) => void;
  setPage: (page: number) => void;
}

export const useClientesFiltros = create<ClientesFiltrosState>((set) => ({
  busca: '',
  ativo: undefined,
  tipoPessoa: undefined,
  page: 1,
  setBusca: (busca) => set({ busca, page: 1 }),
  setAtivo: (ativo) => set({ ativo, page: 1 }),
  setTipoPessoa: (tipoPessoa) => set({ tipoPessoa, page: 1 }),
  setPage: (page) => set({ page }),
}));
