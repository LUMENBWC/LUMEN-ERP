-- ===========================================================================
-- 01 - Bootstrap dos papéis Postgres (rodar UMA vez por projeto Supabase)
-- ===========================================================================
--
-- Rode este script ANTES da primeira `prisma migrate deploy` de um ambiente
-- novo, conectado como `postgres` (SQL Editor do Supabase serve).
--
-- Por que isto existe, e não está dentro de uma migration:
--
--   1. SEGREDO. Senha em migration é senha em git. A migration
--      20260803005036_roles_rls_auth_fk cria os dois papéis SEM senha, de
--      forma idempotente; quem define a senha é este script, que você
--      preenche na hora e NÃO versiona preenchido.
--
--   2. ORDEM/OWNERSHIP. Criando `prisma_migrator` antes de qualquer migration,
--      você pode apontar DIRECT_URL para ele já na primeira execução - e aí
--      TODAS as tabelas nascem sob `prisma_migrator`. Isso elimina o problema
--      recorrente registrado nos docs dos módulos, em que cada `ALTER TABLE`
--      precisava ser aplicada por fora porque as tabelas pertenciam ao role
--      `postgres`.
--
-- ---------------------------------------------------------------------------
-- ANTES DE RODAR: troque os dois placeholders por senhas fortes e distintas.
-- Não reaproveite nenhuma senha que já tenha existido neste repositório - as
-- senhas anteriores estavam em texto puro num repositório público e devem ser
-- tratadas como comprometidas.
-- ---------------------------------------------------------------------------

-- Papel de runtime da API. SEM BYPASSRLS: é isso que faz o Row Level Security
-- valer de verdade como defesa em profundidade (ver ADR-0002).
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_api') THEN
    CREATE ROLE app_api LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
END
$$;

ALTER ROLE app_api WITH PASSWORD 'TROQUE_POR_UMA_SENHA_FORTE_APP_API';

-- Papel de migrations (DDL). BYPASSRLS + CREATEDB conforme o guia oficial
-- Prisma + Supabase (introspecção e shadow database do `migrate dev`).
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'prisma_migrator') THEN
    CREATE USER prisma_migrator WITH BYPASSRLS CREATEDB;
  END IF;
END
$$;

ALTER ROLE prisma_migrator WITH PASSWORD 'TROQUE_POR_UMA_SENHA_FORTE_MIGRATOR';

GRANT prisma_migrator TO postgres;

-- ---------------------------------------------------------------------------
-- Conferência
-- ---------------------------------------------------------------------------
-- `app_api` PRECISA aparecer com rolbypassrls = false. Se aparecer true, o RLS
-- não protege nada e o isolamento entre empresas depende só da aplicação.
SELECT rolname, rolbypassrls, rolcreatedb, rolcanlogin
FROM pg_roles
WHERE rolname IN ('app_api', 'prisma_migrator');

-- ---------------------------------------------------------------------------
-- DEPOIS DE RODAR
-- ---------------------------------------------------------------------------
-- Monte as duas connection strings do .env com as senhas que você acabou de
-- definir (pooler Supavisor em modo SESSION - não transaction; ver ADR-0002):
--
--   DATABASE_URL = postgresql://app_api.<REF>:<SENHA_APP_API>@<HOST>:5432/postgres
--   DIRECT_URL   = postgresql://prisma_migrator.<REF>:<SENHA_MIGRATOR>@<HOST>:5432/postgres
--
-- Em seguida: pnpm --filter @erp/api exec prisma migrate deploy
-- Ver docs/deploy.md para a sequência completa.
