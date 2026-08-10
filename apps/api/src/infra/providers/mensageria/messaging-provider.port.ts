export type TemplateMensagem = 'ORCAMENTO_ENVIADO' | 'VENDA_CONFIRMADA' | 'COBRANCA_VENCENDO';

export interface EnviarMensagemInput {
  empresaId: string;
  destinatarioTelefone: string;
  template: TemplateMensagem;
  variaveis: Record<string, string>;
}

export interface MensagemEnviada {
  id: string;
  status: 'ENVIADO' | 'FALHA';
}

/**
 * Porta para envio de mensagens (WhatsApp Business API).
 * Sem implementação concreta no MVP — ver StubMessagingProvider.
 */
export interface MessagingProvider {
  enviarMensagem(input: EnviarMensagemInput): Promise<MensagemEnviada>;
}
