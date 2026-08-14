import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        // Limite global: 100 requisições por 15 minutos (900 segundos)
        ttl: 900,
        limit: 100,
      },
      {
        // Limite para login/auth: 5 requisições por 15 minutos
        name: 'auth',
        ttl: 900,
        limit: 5,
      },
      {
        // Limite para criação de recursos: 50 por hora
        name: 'create',
        ttl: 3600,
        limit: 50,
      },
    ]),
  ],
})
export class RateLimitModule {}
