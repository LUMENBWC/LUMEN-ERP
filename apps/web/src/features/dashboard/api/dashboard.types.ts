export interface Periodo {
  inicio: string;
  fim: string;
}

export interface AgingResumo {
  aVencer: string;
  vencido: string;
}

export interface ResumoFinanceiro {
  periodo: Periodo;
  faturamento: string;
  custoProdutosVendidos: string;
  despesasPagas: string;
  lucro: string;
  quantidadeVendas: number;
  totalAReceber: string;
  agingReceber: AgingResumo;
  totalAPagar: string;
  agingPagar: AgingResumo;
}

export interface ProdutoMaisVendidoResumo {
  produtoId: string;
  produtoNome: string;
  quantidadeVendida: string;
  valorVendido: string;
}

export interface ProdutosMaisVendidosResultado {
  periodo: Periodo;
  porQuantidade: ProdutoMaisVendidoResumo[];
  porValor: ProdutoMaisVendidoResumo[];
}

export interface FluxoCaixaResultado {
  periodo: Periodo;
  entradas: string;
  saidas: string;
  saldo: string;
}

export interface PeriodoParams {
  dataInicio?: string;
  dataFim?: string;
}

/** Resposta do endpoint agregado `GET /dashboard` (resumo + produtos + fluxo). */
export interface DashboardResultado {
  resumo: ResumoFinanceiro;
  produtosMaisVendidos: ProdutosMaisVendidosResultado;
  fluxoCaixa: FluxoCaixaResultado;
}
