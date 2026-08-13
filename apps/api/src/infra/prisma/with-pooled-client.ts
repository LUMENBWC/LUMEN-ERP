import { Logger } from '@nestjs/common';
import type { Pool, PoolClient } from 'pg';

const logger = new Logger('PooledClient');

/**
 * Faz checkout de um client do pool, roda `fn` com ele e devolve/descarta a
 * conexão corretamente.
 *
 * Por que isto existe: `pool.on('error')` — que `PrismaService` já anexa nos
 * dois pools — só cobre clients **ociosos dentro do pool**. Um client em uso
 * (checked-out) emite `'error'` por conta própria quando a conexão física cai,
 * e sem listener nesse client o Node derruba o processo inteiro (um `'error'`
 * sem ouvinte num EventEmitter é exceção não tratada).
 *
 * Isso não é hipotético: com a API já iniciada e servindo, o Supavisor
 * derrubou uma conexão e o processo morreu com
 * `Error: Connection terminated unexpectedly` /
 * `Emitted 'error' event on Client instance`. Em produção, onde o pooler
 * recicla conexões por rotina, isso vira crash-loop do container.
 *
 * Além do listener, o `release` importa: uma conexão que quebrou precisa ser
 * **descartada** (`release(true)`), não devolvida ao pool — devolver uma
 * conexão morta só transfere a falha para o próximo chamador.
 */
export async function withPooledClient<T>(
  pool: Pool,
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();

  let conexaoQuebrada = false;
  const onError = (err: Error) => {
    // Só marca como quebrada aqui, no evento de erro da própria conexão.
    // Um erro de query (constraint violada, erro de domínio) rejeita a
    // promise sem invalidar a conexão, e nesse caso ela pode voltar ao pool.
    conexaoQuebrada = true;
    logger.error('Conexão em uso terminada pelo Postgres - descartando do pool.', err.stack);
  };
  client.on('error', onError);

  try {
    return await fn(client);
  } finally {
    client.off('error', onError);
    client.release(conexaoQuebrada || undefined);
  }
}
