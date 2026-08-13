import { apiJson } from '@/lib/api/client';
import type {
  ConverterOrcamentoInput,
  FinalizarVendaInput,
  ListarVendasParams,
  ListarVendasResultado,
  VendaDetalhada,
} from './vendas.types';

function buildQuery(params: ListarVendasParams): string {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('perPage', String(params.perPage));
  if (params.clienteId) search.set('clienteId', params.clienteId);
  if (params.status) search.set('status', params.status);
  if (params.dataInicio) search.set('dataInicio', params.dataInicio);
  if (params.dataFim) search.set('dataFim', params.dataFim);
  if (params.sortBy) search.set('sortBy', params.sortBy);
  if (params.sortDir) search.set('sortDir', params.sortDir);
  return search.toString();
}

export const vendasApi = {
  listar: (params: ListarVendasParams) =>
    apiJson<ListarVendasResultado>(`/vendas?${buildQuery(params)}`),
  obter: (id: string) => apiJson<VendaDetalhada>(`/vendas/${id}`),
  finalizar: (input: FinalizarVendaInput) =>
    apiJson<VendaDetalhada>('/vendas', {
      method: 'POST',
      body: JSON.stringify({
        clienteId: input.clienteId,
        itens: input.itens.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          desconto: item.desconto,
        })),
        descontoGeral: input.descontoGeral,
        pagamentos: input.pagamentos,
      }),
    }),
  cancelar: (id: string) => apiJson<void>(`/vendas/${id}/cancelar`, { method: 'POST' }),
  converter: (input: ConverterOrcamentoInput) =>
    apiJson<VendaDetalhada>('/vendas', {
      method: 'POST',
      body: JSON.stringify({
        orcamentoId: input.orcamentoId,
        pagamentos: input.pagamentos,
      }),
    }),
};
