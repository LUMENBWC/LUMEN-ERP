import { create } from 'zustand';
import type { StatusOrcamento } from '../api/orcamentos.types';

interface OrcamentosFiltrosState {
  clienteId: string | undefined;
  status: StatusOrcamento | undefined;
  page: number;
  setClienteId: (clienteId: string | undefined) => void;
  setStatus: (status: StatusOrcamento | undefined) => void;
  setPage: (page: number) => void;
}

export const useOrcamentosFiltros = create<OrcamentosFiltrosState>((set) => ({
  clienteId: undefined,
  status: undefined,
  page: 1,
  setClienteId: (clienteId) => set({ clienteId, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setPage: (page) => set({ page }),
}));
