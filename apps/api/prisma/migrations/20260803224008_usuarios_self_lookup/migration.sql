-- Bootstraps tenant resolution: the AuthGuard knows a verified Supabase Auth
-- user id (JWT `sub`) but not yet which empresa they belong to, so the
-- existing tenant_isolation policy (keyed on app.empresa_id) can't apply.
-- This policy allows a connection to look up its own usuario row by
-- authUserId alone, scoped to app.auth_user_id (set right after JWT
-- verification, before app.empresa_id is known). It is additive/permissive
-- alongside tenant_isolation - Postgres OR's together all matching
-- permissive policies for a given command - so normal tenant-scoped reads
-- are unaffected.
CREATE POLICY self_lookup ON "usuarios" FOR SELECT TO app_api
  USING ("authUserId" = (select current_setting('app.auth_user_id', true))::uuid);
