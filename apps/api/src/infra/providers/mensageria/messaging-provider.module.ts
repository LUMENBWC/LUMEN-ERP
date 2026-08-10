import { Module } from '@nestjs/common';
import { MESSAGING_PROVIDER } from './messaging-provider.token';
import { StubMessagingProvider } from './stub-messaging.provider';

@Module({
  providers: [{ provide: MESSAGING_PROVIDER, useClass: StubMessagingProvider }],
  exports: [MESSAGING_PROVIDER],
})
export class MessagingProviderModule {}
