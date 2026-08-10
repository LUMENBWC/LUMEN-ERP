import { ProviderNaoImplementadoError } from '../provider-nao-implementado.error';
import { StubShippingProvider } from './stub-shipping.provider';

describe('StubShippingProvider', () => {
  const provider = new StubShippingProvider();

  it('rejeita calcularFrete com ProviderNaoImplementadoError', async () => {
    await expect(
      provider.calcularFrete({ cepOrigem: '01001000', cepDestino: '20040020', pesoKg: 1 }),
    ).rejects.toThrow(ProviderNaoImplementadoError);
  });

  it('rejeita rastrear com ProviderNaoImplementadoError', async () => {
    await expect(provider.rastrear('BR123456789')).rejects.toThrow(ProviderNaoImplementadoError);
  });
});
