# Autenticação & Autorização (Etapa 2)

## O que existe

**Backend (`apps/api`)**

- `@supabase/server/core`'s `verifyAuth` valida o JWT do Supabase Auth contra o JWKS público do projeto (`SUPABASE_JWKS_URL`, chaves assimétricas ES256) — sem precisar de nenhum segredo.
- **`SupabaseAuthGuard`** (`src/common/auth/supabase-auth.guard.ts`): valida o JWT, resolve o `TenantContext` via `resolveTenantContext` e anexa em `request.tenantContext`. Aplicado globalmente (`APP_GUARD`).
- **`resolveTenantContext`** (`src/common/tenant/resolve-tenant-context.ts`): dado o `sub` do JWT, resolve `empresaId`, dados do usuário e o conjunto de permissões, em **duas transações separadas, em dois pools `pg` separados** (ver migration `20260803224008_usuarios_self_lookup`, [ADR-0002](../decisions/ADR-0002-papeis-postgres-rls.md) e [ADR-0003](../decisions/ADR-0003-supavisor-guc-bootstrap-pool.md)):
  1. no `prisma.authBootstrapPool`, define `app.auth_user_id` e busca `usuarios` pela policy `self_lookup`.
  2. no `prisma.pgPool` (o mesmo usado pelo Prisma para tudo mais), agora que `empresaId` é conhecido, define `app.empresa_id` e lê papéis/permissões pela policy `tenant_isolation` normal.
     Os dois pools existem porque o Supavisor (pooler da Supabase) corrompe `current_setting()` quando uma mesma conexão física já viu mais de um nome de variável de sessão customizada — ver ADR-0003 para os detalhes e para as regras de quem pode usar cada pool.
- **`PermissionsGuard`** + `@RequirePermissions('produtos.criar', ...)`: nega acesso se o `TenantContext` não tiver alguma das permissões exigidas. Aplicado globalmente, mas só age em rotas decoradas.
- **`@Public()`**: isenta uma rota do `SupabaseAuthGuard` (usado em `/health`).
- **`@CurrentTenant()`**: decorator de parâmetro que extrai o `TenantContext` da request.
- **`GET /api/v1/me`**: retorna o `TenantContext` resolvido do usuário autenticado — usado pelo frontend para popular a UI após login.

**Frontend (`apps/web`)**

- `@supabase/ssr` gerencia a sessão via cookies. `middleware.ts` roda em toda request e renova o access token antes de Server Components/Route Handlers rodarem.
- `lib/supabase/client.ts` (client components) e `lib/supabase/server.ts` (Server Components/Actions).
- `lib/api/server.ts` — `apiFetch(path)`: busca a sessão atual e chama a API NestJS com `Authorization: Bearer <token>`.
- `app/(auth)/login/page.tsx`: formulário de login (React Hook Form + Zod), `supabase.auth.signInWithPassword`.
- `app/(dashboard)/layout.tsx`: checa sessão no servidor, redireciona pra `/login` se não houver usuário.
- `app/(dashboard)/dashboard/page.tsx`: chama `/me` e mostra os dados do usuário logado.
- `app/page.tsx`: redireciona para `/dashboard` ou `/login` conforme o estado da sessão.

## Decisões / limitações conhecidas

- Backend usa só `@supabase/server/core`'s `verifyAuth` — **não** usa `withSupabase`/`SupabaseCtx` do adapter NestJS do pacote, porque isso criaria automaticamente um client `supabaseAdmin` exigindo `SUPABASE_SECRET_KEY`, que não é necessária aqui (toda leitura/escrita de negócio passa por Prisma, não por supabase-js/PostgREST).
- Segue a convenção de chaves nova do Supabase (`SUPABASE_PUBLISHABLE_KEY`/`SUPABASE_SECRET_KEY`, `sb_publishable_...`/`sb_secret_...`), não as chaves legadas (`SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY`).
- `SUPABASE_SECRET_KEY` fica vazia por enquanto — só será necessária quando o backend precisar de um client supabase-js com bypass de RLS (ex.: Storage, Etapa 8).
- Não há fluxo de "esqueci minha senha" ou cadastro de usuário pela UI ainda — criação de usuário continua manual (seed ou, futuramente, o módulo de Usuários da Etapa 3).
- `resolveTenantContext` não está coberto por teste unitário direto (precisaria de um Postgres real); a lógica de RLS por trás dele já foi validada manualmente na Etapa 1. `SupabaseAuthGuard` e `PermissionsGuard` têm testes unitários com mocks.
