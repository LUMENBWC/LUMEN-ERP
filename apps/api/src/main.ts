import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { getHelmetConfig } from './common/security/helmet.config';

const API_PREFIX = 'api/v1';

/**
 * Origens permitidas para CORS, de `CORS_ORIGINS` (lista separada por vírgula).
 *
 * Em produção a variável é obrigatória: sem ela o boot falha, em vez de subir
 * com `origin: *` silenciosamente. A autenticação é por `Authorization: Bearer`
 * (não por cookie), então uma origem curinga não permite sequestro de sessão
 * por si só - mas expõe a API a qualquer site e não há motivo para isso quando
 * o front tem domínio conhecido.
 */
function resolveCorsOrigin(): string[] | boolean {
  const origens = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origem) => origem.trim())
    .filter(Boolean);

  if (origens.length > 0) {
    return origens;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'CORS_ORIGINS é obrigatória em produção - defina a(s) origem(ns) do front (ex.: https://app.lumen.com.br).',
    );
  }

  // Dev: reflete a origem da requisição (equivale ao comportamento anterior).
  return true;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Sem isso, onModuleDestroy() (que fecha pgPool/authBootstrapPool - ver
  // ADR-0003) nunca roda em SIGTERM/SIGINT, incluindo todo restart do
  // `nest start --watch` a cada arquivo salvo em dev: as conexões antigas
  // ficam penduradas no Supavisor em vez de fechadas de forma limpa.
  app.enableShutdownHooks();

  // Desabilita o header X-Powered-By de forma redundante (helmet já faz)
  app.disable('x-powered-by');

  // Security: headers HTTP de segurança (CSP, HSTS, X-Frame-Options, etc)
  app.use(getHelmetConfig());

  // Security: limita tamanho da requisição
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'POST' || req.method === 'PATCH') {
      const contentLength = parseInt(req.headers['content-length'] ?? '0', 10);
      if (contentLength > 10 * 1024 * 1024) {
        // 10MB limite
        res.status(413).json({ message: 'Payload muito grande' });
        return;
      }
    }
    next();
  });

  app.enableCors({
    origin: resolveCorsOrigin(),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    maxAge: 86400,
    credentials: false, // Bearer token, não cookie
  });
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  // O Swagger publica o mapa completo de rotas, DTOs e permissões exigidas.
  // Fica fora de produção por padrão; `ENABLE_SWAGGER=true` reabilita quando
  // for realmente necessário depurar um ambiente publicado.
  const swaggerHabilitado =
    process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true';

  if (swaggerHabilitado) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('LUMEN ERP API')
      .setDescription('API do LUMEN ERP - ERP SaaS multiempresa')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${API_PREFIX}/docs`, app, document);
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}

bootstrap();
