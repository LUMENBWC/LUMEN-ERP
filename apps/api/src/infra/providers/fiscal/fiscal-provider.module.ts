import { Module } from '@nestjs/common';
import { FISCAL_PROVIDER } from './fiscal-provider.token';
import { StubFiscalProvider } from './stub-fiscal.provider';

@Module({
  providers: [{ provide: FISCAL_PROVIDER, useClass: StubFiscalProvider }],
  exports: [FISCAL_PROVIDER],
})
export class FiscalProviderModule {}
