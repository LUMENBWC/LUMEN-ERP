import { Injectable } from '@nestjs/common';
import { ProviderNaoImplementadoError } from '../provider-nao-implementado.error';
import type {
  CobrancaCriada,
  CriarCobrancaInput,
  PaymentGatewayProvider,
  StatusCobranca,
} from './payment-gateway-provider.port';

@Injectable()
export class StubPaymentGatewayProvider implements PaymentGatewayProvider {
  async criarCobranca(_input: CriarCobrancaInput): Promise<CobrancaCriada> {
    throw new ProviderNaoImplementadoError('PaymentGatewayProvider', 'criação de cobrança');
  }

  async consultarStatus(_cobrancaId: string): Promise<StatusCobranca> {
    throw new ProviderNaoImplementadoError(
      'PaymentGatewayProvider',
      'consulta de status de cobrança',
    );
  }

  async cancelarCobranca(_cobrancaId: string): Promise<void> {
    throw new ProviderNaoImplementadoError('PaymentGatewayProvider', 'cancelamento de cobrança');
  }
}
