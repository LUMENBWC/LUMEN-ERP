-- ---------------------------------------------------------------------------
-- Application role (RLS-bound)
--
-- The default `postgres` role on Supabase has BYPASSRLS, so RLS policies
-- provide zero protection to a backend connected as `postgres`. The running
-- API must connect as `app_api` (DATABASE_URL) so RLS is actually enforced
-- as defense-in-depth against tenant-scoping bugs in the application layer.
-- Migrations continue to run as `postgres` (DIRECT_URL), which needs DDL
-- rights that `app_api` intentionally does not have.
-- ---------------------------------------------------------------------------

CREATE ROLE app_api LOGIN PASSWORD '3TCe8aucaqqPZxLo09tVHGhTwquIHF0Y' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;

GRANT USAGE ON SCHEMA public TO app_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_api;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_api;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_api;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_api;

-- ---------------------------------------------------------------------------
-- Migrator role
--
-- Prisma Migrate (DDL) cannot run as `postgres` - Supabase protects that
-- role's password and it can't be rotated via SQL - so schema changes run
-- as a dedicated role instead. BYPASSRLS + CREATEDB mirror the official
-- Prisma+Supabase guide, needed for introspection and `migrate dev`
-- shadow-database creation.
-- ---------------------------------------------------------------------------

CREATE USER prisma_migrator WITH PASSWORD 'S8vGqzYVQqE1o1Iz2GG97sVeamOZeBBP' BYPASSRLS CREATEDB;

GRANT prisma_migrator TO postgres;

GRANT USAGE ON SCHEMA public TO prisma_migrator;
GRANT CREATE ON SCHEMA public TO prisma_migrator;
GRANT ALL ON ALL TABLES IN SCHEMA public TO prisma_migrator;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO prisma_migrator;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO prisma_migrator;
ALTER DEFAULT PRIVILEGES FOR ROLE prisma_migrator IN SCHEMA public GRANT ALL ON TABLES TO prisma_migrator;
ALTER DEFAULT PRIVILEGES FOR ROLE prisma_migrator IN SCHEMA public GRANT ALL ON ROUTINES TO prisma_migrator;
ALTER DEFAULT PRIVILEGES FOR ROLE prisma_migrator IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma_migrator;

-- Supabase auto-enables RLS on newly created public tables via an internal
-- SECURITY DEFINER event trigger function. It's not meant to be invoked
-- directly, but Postgres grants EXECUTE on new functions to PUBLIC by
-- default, so lock that down explicitly.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Cross-schema foreign key to Supabase Auth
-- ---------------------------------------------------------------------------

ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_authUserId_fkey" FOREIGN KEY ("authUserId") REFERENCES auth.users(id) ON DELETE CASCADE;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Tenant isolation is keyed off current_setting('app.empresa_id', true),
-- a session variable the application sets per request/transaction from the
-- authenticated user's empresaId (wired up in Etapa 2 alongside TenantContext).
-- When unset, current_setting(...) returns NULL and every comparison below
-- evaluates to unknown/false, so access fails closed by default. The
-- current_setting() call is wrapped in `(select ...)` so Postgres evaluates
-- it once per statement (InitPlan) instead of once per row.
-- ---------------------------------------------------------------------------

ALTER TABLE "empresas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "filiais" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usuarios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "papeis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "permissoes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "papel_permissoes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usuario_papeis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categorias" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "produtos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "movimentacoes_estoque" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clientes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fornecedores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fornecedor_produtos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orcamentos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orcamento_itens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vendas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "venda_itens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "venda_pagamentos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contas_receber" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "recebimentos_recebivel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categorias_despesa" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contas_pagar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pagamentos_pagavel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "caixa_sessoes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "movimentos_caixa" ENABLE ROW LEVEL SECURITY;

-- `empresas` is the tenant root: no empresaId column on itself. Scoped by id.
-- No INSERT/DELETE policy for app_api - tenant provisioning/deprovisioning
-- goes through a privileged path (seed / future admin function), not
-- request-time app traffic.
CREATE POLICY tenant_select ON "empresas" FOR SELECT TO app_api
  USING (id = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_update ON "empresas" FOR UPDATE TO app_api
  USING (id = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK (id = (select current_setting('app.empresa_id', true))::uuid);

-- `permissoes` is a global read-only catalog, not tenant-scoped.
CREATE POLICY catalog_select ON "permissoes" FOR SELECT TO app_api
  USING (true);

CREATE POLICY tenant_isolation ON "filiais" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "usuarios" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "papeis" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "papel_permissoes" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "usuario_papeis" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "audit_logs" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "categorias" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "produtos" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "movimentacoes_estoque" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "clientes" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "fornecedores" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "fornecedor_produtos" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "orcamentos" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "orcamento_itens" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "vendas" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "venda_itens" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "venda_pagamentos" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "contas_receber" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "recebimentos_recebivel" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "categorias_despesa" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "contas_pagar" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "pagamentos_pagavel" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "caixa_sessoes" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
CREATE POLICY tenant_isolation ON "movimentos_caixa" FOR ALL TO app_api
  USING ("empresaId" = (select current_setting('app.empresa_id', true))::uuid)
  WITH CHECK ("empresaId" = (select current_setting('app.empresa_id', true))::uuid);
