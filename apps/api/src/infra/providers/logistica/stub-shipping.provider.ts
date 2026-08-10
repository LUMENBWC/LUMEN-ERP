import { Injectable } from '@nestjs/common';
import { ProviderNaoImplementadoError } from '../provider-nao-implementado.error';
import type {
  CalcularFreteInput,
  OpcaoFrete,
  RastreioEncomenda,
  ShippingProvider,
} from './shipping-provider.port';

@Injectable()
export class StubShippingProvider implements ShippingProvider {
  async calcularFrete(_input: CalcularFreteInput): Promise<OpcaoFrete[]> {
    throw new ProviderNaoImplementadoError('ShippingProvider', 'cálculo de frete');
  }

  async rastrear(_codigoRastreio: string): Promise<RastreioEncomenda> {
    throw new ProviderNaoImplementadoError('ShippingProvider', 'rastreio de encomenda');
  }
}
