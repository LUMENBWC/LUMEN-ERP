import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { AllExceptionsFilter } from '../../src/common/filters/http-exception.filter';

export const API_PREFIX = 'api/v1';

/**
 * App real de ponta a ponta (Postgres/RLS/RBAC reais, todos os módulos).
 * Nenhum override de guard - `SupabaseAuthGuard` aceita o header de teste
 * `x-test-auth-user-id` no lugar de um JWT real quando NODE_ENV=test (ver
 * comentário em `src/common/auth/supabase-auth.guard.ts`), então o mesmo
 * app serve tanto os specs de fluxo de negócio quanto o spec de autenticação
 * (que simplesmente nunca manda esse header, só um Bearer real).
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.init();
  return app;
}
