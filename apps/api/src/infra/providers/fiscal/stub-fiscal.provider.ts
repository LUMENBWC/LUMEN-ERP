import { Injectable } from '@nestjs/common';
import { ProviderNaoImplementadoError } from '../provider-nao-implementado.error';
import type {
  DocumentoFiscalEmitido,
  EmitirDocumentoFiscalInput,
  FiscalProvider,
  StatusDocumentoFiscal,
} from './fiscal-provider.port';

@Injectable()
export class StubFiscalProvider implements FiscalProvider {
  async emitir(_input: EmitirDocumentoFiscalInput): Promise<DocumentoFiscalEmitido> {
    throw new ProviderNaoImplementadoError('FiscalProvider', 'emissão de documento fiscal');
  }

  async cancelar(_chaveAcesso: string, _justificativa: string): Promise<void> {
    throw new ProviderNaoImplementadoError('FiscalProvider', 'cancelamento de documento fiscal');
  }

  async consultarStatus(_chaveAcesso: string): Promise<StatusDocumentoFiscal> {
    throw new ProviderNaoImplementadoError('FiscalProvider', 'consulta de status fiscal');
  }
}
