import { create } from 'zustand';
import type { ItemVendaInput } from '@/features/vendas/api/vendas.types';

interface CarrinhoState {
  clienteId: string | null;
  clienteNome: string | null;
  itens: ItemVendaInput[];
  descontoGeral: number;
  setCliente: (id: string | null, nome: string | null) => void;
  adicionarItem: (item: ItemVendaInput) => void;
  removerItem: (produtoId: string) => void;
  atualizarItem: (produtoId: string, patch: Partial<ItemVendaInput>) => void;
  setDescontoGeral: (valor: number) => void;
  limpar: () => void;
}

export const useCarrinho = create<CarrinhoState>((set) => ({
  clienteId: null,
  clienteNome: null,
  itens: [],
  descontoGeral: 0,
  setCliente: (id, nome) => set({ clienteId: id, clienteNome: nome }),
  adicionarItem: (item) =>
    set((state) => {
      const existente = state.itens.find((i) => i.produtoId === item.produtoId);
      if (existente) {
        return {
          itens: state.itens.map((i) =>
            i.produtoId === item.produtoId
              ? { ...i, quantidade: i.quantidade + item.quantidade }
              : i,
          ),
        };
      }
      return { itens: [...state.itens, item] };
    }),
  removerItem: (produtoId) =>
    set((state) => ({ itens: state.itens.filter((i) => i.produtoId !== produtoId) })),
  atualizarItem: (produtoId, patch) =>
    set((state) => ({
      itens: state.itens.map((i) => (i.produtoId === produtoId ? { ...i, ...patch } : i)),
    })),
  setDescontoGeral: (valor) => set({ descontoGeral: valor }),
  limpar: () => set({ clienteId: null, clienteNome: null, itens: [], descontoGeral: 0 }),
}));
