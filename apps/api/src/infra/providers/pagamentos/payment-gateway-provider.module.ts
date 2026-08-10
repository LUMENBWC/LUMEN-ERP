import { Module } from '@nestjs/common';
import { PAYMENT_GATEWAY_PROVIDER } from './payment-gateway-provider.token';
import { StubPaymentGatewayProvider } from './stub-payment-gateway.provider';

@Module({
  providers: [{ provide: PAYMENT_GATEWAY_PROVIDER, useClass: StubPaymentGatewayProvider }],
  exports: [PAYMENT_GATEWAY_PROVIDER],
})
export class PaymentGatewayProviderModule {}
