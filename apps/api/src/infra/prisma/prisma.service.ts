import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../../../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  /**
   * The `pg` pool backing this client, exposed for call sites that need to
   * bypass Prisma's query layer entirely (see
   * `common/tenant/resolve-tenant-context.ts` for why).
   */
  readonly pgPool: Pool;

  constructor(configService: ConfigService) {
    const pool = new Pool({ connectionString: configService.getOrThrow<string>('DATABASE_URL') });
    const adapter = new PrismaPg(pool, { disposeExternalPool: true });
    super({ adapter });
    this.pgPool = pool;
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Conectado ao Postgres (papel app_api).');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
