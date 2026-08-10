import { Module } from '@nestjs/common';
import { SHIPPING_PROVIDER } from './shipping-provider.token';
import { StubShippingProvider } from './stub-shipping.provider';

@Module({
  providers: [{ provide: SHIPPING_PROVIDER, useClass: StubShippingProvider }],
  exports: [SHIPPING_PROVIDER],
})
export class ShippingProviderModule {}
