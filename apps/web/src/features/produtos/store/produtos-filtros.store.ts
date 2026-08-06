import { create } from 'zustand';

interface ProdutosFiltrosState {
  busca: string;
  ativo: boolean | undefined;
  categoriaId: string | undefined;
  abaixoDoMinimo: boolean;
  page: number;
  setBusca: (busca: string) => void;
  setAtivo: (ativo: boolean | undefined) => void;
  setCategoriaId: (categoriaId: string | undefined) => void;
  setAbaixoDoMinimo: (abaixoDoMinimo: boolean) => void;
  setPage: (page: number) => void;
}

export const useProdutosFiltros = create<ProdutosFiltrosState>((set) => ({
  busca: '',
  ativo: undefined,
  categoriaId: undefined,
  abaixoDoMinimo: false,
  page: 1,
  setBusca: (busca) => set({ busca, page: 1 }),
  setAtivo: (ativo) => set({ ativo, page: 1 }),
  setCategoriaId: (categoriaId) => set({ categoriaId, page: 1 }),
  setAbaixoDoMinimo: (abaixoDoMinimo) => set({ abaixoDoMinimo, page: 1 }),
  setPage: (page) => set({ page }),
}));
