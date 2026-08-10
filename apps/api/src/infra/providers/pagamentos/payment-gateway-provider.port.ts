export type FormaCobranca = 'PIX' | 'BOLETO' | 'CARTAO';

export type StatusCobranca = 'PENDENTE' | 'PAGO' | 'EXPIRADO' | 'CANCELADO';

export interface CriarCobrancaInput {
  empresaId: string;
  valor: number;
  descricao: string;
  formaCobranca: FormaCobranca;
  referenciaExterna: string;
}

export interface CobrancaCriada {
  id: string;
  status: StatusCobranca;
  linkPagamento?: string;
  qrCodePix?: string;
  linhaDigitavel?: string;
}

/**
 * Porta para gateways de pagamento (Banco Inter, Asaas, Mercado Pago, Stone).
 * Sem implementação concreta no MVP — ver StubPaymentGatewayProvider.
 */
export interface PaymentGatewayProvider {
  criarCobranca(input: CriarCobrancaInput): Promise<CobrancaCriada>;
  consultarStatus(cobrancaId: string): Promise<StatusCobranca>;
  cancelarCobranca(cobrancaId: string): Promise<void>;
}
