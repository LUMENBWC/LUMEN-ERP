import { ProviderNaoImplementadoError } from '../provider-nao-implementado.error';
import { StubMessagingProvider } from './stub-messaging.provider';

describe('StubMessagingProvider', () => {
  const provider = new StubMessagingProvider();

  it('rejeita enviarMensagem com ProviderNaoImplementadoError', async () => {
    await expect(
      provider.enviarMensagem({
        empresaId: 'empresa-1',
        destinatarioTelefone: '+5511999999999',
        template: 'VENDA_CONFIRMADA',
        variaveis: {},
      }),
    ).rejects.toThrow(ProviderNaoImplementadoError);
  });
});
