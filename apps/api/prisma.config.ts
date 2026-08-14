import path from 'node:path';
import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

config({ path: path.resolve(__dirname, '../../.env') });

// The Prisma CLI (migrate/generate/studio) always uses the direct
// connection (`prisma_migrator`, BYPASSRLS+CREATEDB - see ADR-0002), never
// the pooled `app_api` one the running app uses. There is no "app runtime"
// vs "CLI" split to configure here beyond that: PrismaService instantiates
// its own adapter from DATABASE_URL independently of this file.
//
// `prisma generate` doesn't open a connection and must keep working with no
// .env present (CI, Docker build) - read process.env directly with a
// placeholder fallback instead of the `env()` helper, which throws when the
// variable is missing even for commands that never use it.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    url:
      process.env.DIRECT_URL ?? 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
  },
});
