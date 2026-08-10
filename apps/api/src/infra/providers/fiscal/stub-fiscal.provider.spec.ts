import { ProviderNaoImplementadoError } from '../provider-nao-implementado.error';
import { StubFiscalProvider } from './stub-fiscal.provider';

describe('StubFiscalProvider', () => {
  const provider = new StubFiscalProvider();

  it('rejeita emitir com ProviderNaoImplementadoError', async () => {
    await expect(
      provider.emitir({
        empresaId: 'empresa-1',
        tipo: 'NFCE',
        vendaId: 'venda-1',
        itens: [],
        destinatario: { nome: 'Cliente', documento: '00000000000' },
        valorTotal: 100,
      }),
    ).rejects.toThrow(ProviderNaoImplementadoError);
  });

  it('rejeita cancelar com ProviderNaoImplementadoError', async () => {
    await expect(provider.cancelar('chave-1', 'engano')).rejects.toThrow(
      ProviderNaoImplementadoError,
    );
  });

  it('rejeita consultarStatus com ProviderNaoImplementadoError', async () => {
    await expect(provider.consultarStatus('chave-1')).rejects.toThrow(ProviderNaoImplementadoError);
  });
});
