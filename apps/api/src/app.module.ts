import path from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuditModule } from './common/audit/audit.module';
import { AuthModule } from './common/auth/auth.module';
import { PrismaModule } from './infra/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { MeModule } from './modules/me/me.module';
import { PapeisModule } from './modules/papeis/presentation/papeis.module';
import { UsuariosModule } from './modules/usuarios/presentation/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(process.cwd(), '../../.env'),
    }),
    PrismaModule,
    AuditModule,
    AuthModule,
    HealthModule,
    MeModule,
    UsuariosModule,
    PapeisModule,
  ],
})
export class AppModule {}
