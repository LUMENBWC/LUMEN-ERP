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
   * `common/tenant/resolve-tenant-context.ts` for why). Every connection
   * this pool ever hands out sets `app.empresa_id` (via `runInTenantContext`
   * or the second half of `resolveTenantContext`) and nothing else - see
   * {@link authBootstrapPool} for why that's load-bearing.
   */
  readonly pgPool: Pool;

  /**
   * A separate, small `pg` pool used *only* to set `app.auth_user_id` (the
   * first half of `resolveTenantContext`'s identity bootstrap). Confirmed via
   * direct load testing (see ADR-0003): Supavisor's connection multiplexing
   * corrupts `current_setting()` reads once a pooled backend has ever been
   * used to set two *different* custom GUC names, even across separate
   * transactions - `invalid input syntax for type uuid: ""` on every query
   * after the first. Keeping this pool's backends dedicated to a single GUC
   * name (`app.auth_user_id`) sidesteps it entirely; `pgPool`'s backends stay
   * dedicated to `app.empresa_id`. Don't run any other query through this
   * pool, and don't merge it with `pgPool`.
   */
  readonly authBootstrapPool: Pool;

  constructor(configService: ConfigService) {
    const connectionString = configService.getOrThrow<string>('DATABASE_URL');
    const pool = new Pool({ connectionString });
    const authBootstrapPool = new Pool({ connectionString, max: 3 });
    // node-postgres requires a listener on the pool - otherwise an idle
    // pooled connection dropped server-side (e.g. Supavisor's idle timeout)
    // emits an unhandled 'error' that can crash the process instead of just
    // evicting that one connection. See https://node-postgres.com/apis/pool.
    pool.on('error', (err) => {
      this.logger.error('Conexão ociosa do pool descartada pelo Postgres.', err);
    });
    authBootstrapPool.on('error', (err) => {
      this.logger.error('Conexão ociosa do authBootstrapPool descartada pelo Postgres.', err);
    });
    const adapter = new PrismaPg(pool, { disposeExternalPool: true });
    super({ adapter });
    this.pgPool = pool;
    this.authBootstrapPool = authBootstrapPool;
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Conectado ao Postgres (papel app_api).');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    await this.authBootstrapPool.end();
  }
}
