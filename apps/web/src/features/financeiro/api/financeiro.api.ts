import type { FormaPagamento } from '@/features/vendas/api/vendas.types';
import { apiJson } from '@/lib/api/client';
import type {
  CategoriaDespesaResumo,
  ContaPagarDetalhada,
  ContaReceberDetalhada,
  CriarContaPagarInput,
  ListarContasPagarParams,
  ListarContasPagarResultado,
  ListarContasReceberParams,
  ListarContasReceberResultado,
} from './financeiro.types';

function buildQueryContasReceber(params: ListarContasReceberParams): string {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('perPage', String(params.perPage));
  if (params.status) search.set('status', params.status);
  if (params.clienteId) search.set('clienteId', params.clienteId);
  if (params.vencido !== undefined) search.set('vencido', String(params.vencido));
  return search.toString();
}

function buildQueryContasPagar(params: ListarContasPagarParams): string {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('perPage', String(params.perPage));
  if (params.status) search.set('status', params.status);
  if (params.fornecedorId) search.set('fornecedorId', params.fornecedorId);
  if (params.categoriaDespesaId) search.set('categoriaDespesaId', params.categoriaDespesaId);
  if (params.vencido !== undefined) search.set('vencido', String(params.vencido));
  return search.toString();
}

export const financeiroApi = {
  listarContasReceber: (params: ListarContasReceberParams) =>
    apiJson<ListarContasReceberResultado>(
      `/financeiro/contas-receber?${buildQueryContasReceber(params)}`,
    ),
  obterContaReceber: (id: string) =>
    apiJson<ContaReceberDetalhada>(`/financeiro/contas-receber/${id}`),
  registrarRecebimento: (id: string, valor: number, formaPagamento: FormaPagamento) =>
    apiJson<void>(`/financeiro/contas-receber/${id}/recebimentos`, {
      method: 'POST',
      body: JSON.stringify({ valor, formaPagamento }),
    }),

  listarCategoriasDespesa: () =>
    apiJson<CategoriaDespesaResumo[]>('/financeiro/categorias-despesa'),
  criarCategoriaDespesa: (nome: string) =>
    apiJson<CategoriaDespesaResumo>('/financeiro/categorias-despesa', {
      method: 'POST',
      body: JSON.stringify({ nome }),
    }),

  listarContasPagar: (params: ListarContasPagarParams) =>
    apiJson<ListarContasPagarResultado>(
      `/financeiro/contas-pagar?${buildQueryContasPagar(params)}`,
    ),
  obterContaPagar: (id: string) => apiJson<ContaPagarDetalhada>(`/financeiro/contas-pagar/${id}`),
  criarContaPagar: (input: CriarContaPagarInput) =>
    apiJson<ContaPagarDetalhada>('/financeiro/contas-pagar', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  registrarPagamento: (id: string, valor: number) =>
    apiJson<void>(`/financeiro/contas-pagar/${id}/pagamentos`, {
      method: 'POST',
      body: JSON.stringify({ valor }),
    }),
  cancelarContaPagar: (id: string) =>
    apiJson<void>(`/financeiro/contas-pagar/${id}/cancelar`, { method: 'POST' }),
};
