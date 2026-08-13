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

    // Dimensionamento explícito, e não o default do `pg` (max: 10).
    //
    // O Supavisor em modo SESSION impõe um teto de clientes por projeto
    // (`pool_size`, tipicamente 15 no plano free). Esse teto é do PROJETO
    // inteiro, não por processo: some todas as réplicas da API, mais Prisma
    // Studio, migrations e testes e2e. Com o default de 10 + 3 do bootstrap,
    // uma única instância já consumia 13 dos 15 - e duas réplicas estouravam
    // o limite de imediato, com
    // `(EMAXCONNSESSION) max clients reached in session mode`.
    //
    // Regra ao dimensionar: (DB_POOL_MAX + DB_AUTH_POOL_MAX) × réplicas
    // precisa ficar FOLGADAMENTE abaixo do `pool_size` do projeto.
    const poolMax = Number(configService.get<string>('DB_POOL_MAX') ?? 8);
    const authPoolMax = Number(configService.get<string>('DB_AUTH_POOL_MAX') ?? 2);

    const pool = new Pool({ connectionString, max: poolMax });
    const authBootstrapPool = new Pool({ connectionString, max: authPoolMax });
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
    // Quem faz checkout de uma conexão (`resolveTenantContext.ts` e
    // `run-in-tenant-context.ts`) roda `DISCARD ALL` com `await` explícito
    // antes do BEGIN - boa higiene contra planos preparados/locks/temp
    // tables sobrando entre reusos do Supavisor. Um listener no evento
    // 'acquire' foi tentado primeiro, mas provou-se não confiável: o
    // handler é fire-and-forget e não há garantia de que sua query termine
    // (ou sequer seja enfileirada) antes da próxima query do próprio
    // chamador na mesma conexão. Isso NÃO é a defesa contra
    // `invalid input syntax for type uuid: ""` - essa é uma correção nas
    // próprias policies RLS (ver ADR-0005): `DISCARD ALL`/`RESET ALL` não
    // limpam um GUC customizado já definido como `''` numa conexão física,
    // então a defesa real precisa estar onde o valor é lido, não em
    // higiene de conexão do lado do cliente.
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
