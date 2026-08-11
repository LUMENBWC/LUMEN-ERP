import path from 'node:path';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

config({ path: path.resolve(__dirname, '../../../../.env') });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variável de ambiente ${name} não definida - preencha o .env antes de rodar os testes e2e.`,
    );
  }
  return value;
}

// Roda como `prisma_migrator` (DIRECT_URL, bypassa RLS) - só para provisionar
// os tenants/usuários de teste antes de cada suíte, nunca para exercitar
// lógica de negócio (isso é feito via HTTP, pela app real). Mesmo padrão de
// apps/api/prisma/seed.ts.
export const prismaDirect = new PrismaClient({
  adapter: new PrismaPg({ connectionString: requireEnv('DIRECT_URL') }),
});
