import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

const API_PREFIX = 'api/v1';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sem isso, onModuleDestroy() (que fecha pgPool/authBootstrapPool - ver
  // ADR-0003) nunca roda em SIGTERM/SIGINT, incluindo todo restart do
  // `nest start --watch` a cada arquivo salvo em dev: as conexões antigas
  // ficam penduradas no Supavisor em vez de fechadas de forma limpa.
  app.enableShutdownHooks();

  app.use(helmet());
  app.enableCors();
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ERP SaaS API')
    .setDescription('API do ERP SaaS multiempresa')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${API_PREFIX}/docs`, app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}

bootstrap();
