import { create } from 'zustand';

interface UsuariosFiltrosState {
  busca: string;
  ativo: boolean | undefined;
  papelId: string | undefined;
  page: number;
  setBusca: (busca: string) => void;
  setAtivo: (ativo: boolean | undefined) => void;
  setPapelId: (papelId: string | undefined) => void;
  setPage: (page: number) => void;
}

/** Estado de UI (filtros/paginação) da listagem de usuários - não é server state, por isso Zustand em vez de TanStack Query. */
export const useUsuariosFiltros = create<UsuariosFiltrosState>((set) => ({
  busca: '',
  ativo: undefined,
  papelId: undefined,
  page: 1,
  setBusca: (busca) => set({ busca, page: 1 }),
  setAtivo: (ativo) => set({ ativo, page: 1 }),
  setPapelId: (papelId) => set({ papelId, page: 1 }),
  setPage: (page) => set({ page }),
}));
