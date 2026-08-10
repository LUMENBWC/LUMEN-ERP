import { ProviderNaoImplementadoError } from '../provider-nao-implementado.error';
import { StubPaymentGatewayProvider } from './stub-payment-gateway.provider';

describe('StubPaymentGatewayProvider', () => {
  const provider = new StubPaymentGatewayProvider();

  it('rejeita criarCobranca com ProviderNaoImplementadoError', async () => {
    await expect(
      provider.criarCobranca({
        empresaId: 'empresa-1',
        valor: 100,
        descricao: 'Venda #1',
        formaCobranca: 'PIX',
        referenciaExterna: 'venda-1',
      }),
    ).rejects.toThrow(ProviderNaoImplementadoError);
  });

  it('rejeita consultarStatus com ProviderNaoImplementadoError', async () => {
    await expect(provider.consultarStatus('cobranca-1')).rejects.toThrow(
      ProviderNaoImplementadoError,
    );
  });

  it('rejeita cancelarCobranca com ProviderNaoImplementadoError', async () => {
    await expect(provider.cancelarCobranca('cobranca-1')).rejects.toThrow(
      ProviderNaoImplementadoError,
    );
  });
});
