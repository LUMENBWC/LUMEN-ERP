export interface DimensoesPacote {
  alturaCm: number;
  larguraCm: number;
  comprimentoCm: number;
}

export interface CalcularFreteInput {
  cepOrigem: string;
  cepDestino: string;
  pesoKg: number;
  dimensoes?: DimensoesPacote;
}

export interface OpcaoFrete {
  transportadora: string;
  servico: string;
  valor: number;
  prazoDias: number;
}

export interface EventoRastreio {
  data: Date;
  descricao: string;
}

export interface RastreioEncomenda {
  status: string;
  eventos: EventoRastreio[];
}

/**
 * Porta para cálculo de frete e rastreio (Correios, Melhor Envio).
 * Sem implementação concreta no MVP — ver StubShippingProvider.
 */
export interface ShippingProvider {
  calcularFrete(input: CalcularFreteInput): Promise<OpcaoFrete[]>;
  rastrear(codigoRastreio: string): Promise<RastreioEncomenda>;
}
