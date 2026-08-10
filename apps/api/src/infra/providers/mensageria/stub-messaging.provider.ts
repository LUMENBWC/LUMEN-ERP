import { Injectable } from '@nestjs/common';
import { ProviderNaoImplementadoError } from '../provider-nao-implementado.error';
import type {
  EnviarMensagemInput,
  MensagemEnviada,
  MessagingProvider,
} from './messaging-provider.port';

@Injectable()
export class StubMessagingProvider implements MessagingProvider {
  async enviarMensagem(_input: EnviarMensagemInput): Promise<MensagemEnviada> {
    throw new ProviderNaoImplementadoError('MessagingProvider', 'envio de mensagem');
  }
}
