# ADR-0002 — Papéis Postgres dedicados para RLS funcionar como defesa em profundidade

- Status: aceito
- Data: 2026-08-03

## Contexto

O ADR-0001 previa RLS como segunda camada de isolamento multi-tenant, complementar à `empresaId` injetada pela aplicação. Ao implementar a Etapa 1, verificou-se que o papel padrão `postgres` fornecido pelo Supabase tem `BYPASSRLS = true` (confirmado via `SELECT rolbypassrls FROM pg_roles`). Qualquer conexão feita com esse papel ignora todas as políticas de RLS — ou seja, se a API se conectasse ao banco como `postgres` (o padrão da connection string do Supabase), o RLS documentado no ADR-0001 não protegeria nada contra bugs de escopo na aplicação.

Além disso, a senha do papel `postgres` é protegida pelo control plane do Supabase — não é possível alterá-la via SQL (`ALTER ROLE postgres PASSWORD ...` retorna `permission denied: only superusers can alter privileged roles`).

## Decisão

Três papéis Postgres com propósitos distintos:

- **`postgres`** — reservado ao Supabase (dashboard, backups, control plane). Não é usado pela aplicação nem pelas migrations.
- **`app_api`** — usado pela API em runtime (`DATABASE_URL`, via pooler Supavisor em modo transaction, porta 6543). Criado **sem** `BYPASSRLS`, com apenas `SELECT/INSERT/UPDATE/DELETE` em `public` — nenhuma permissão de DDL. É o papel contra o qual as políticas de RLS (`TO app_api`) são de fato aplicadas.
- **`prisma_migrator`** — usado exclusivamente pelo Prisma Migrate (`DIRECT_URL`, conexão direta, porta 5432). Criado com `BYPASSRLS CREATEDB` (necessário para introspecção de schema e para o shadow database do `prisma migrate dev`), seguindo o guia oficial Prisma+Supabase.

Isolamento multi-tenant em RLS é resolvido via `current_setting('app.empresa_id', true)`, uma variável de sessão que a aplicação define por requisição/transação a partir do `TenantContext` (implementado na Etapa 2). As políticas usam `(select current_setting(...))` — não a chamada direta — para que o Postgres avalie a função uma vez por statement (InitPlan) em vez de uma vez por linha, conforme recomendação de performance do próprio Postgres/Supabase para RLS.

A tabela `empresas` (raiz do tenant) não tem coluna `empresaId` própria; sua política usa `id = current_setting(...)`. Não há política de `INSERT`/`DELETE` para `app_api` nessa tabela — criação/remoção de empresa (provisionamento de tenant) é uma operação privilegiada que ainda não tem um fluxo de aplicação definido (não faz parte de nenhuma Etapa do MVP) e, quando existir, deverá rodar por um caminho separado (ex.: função `SECURITY DEFINER` auditada, ou o próprio `prisma_migrator`/seed), nunca como tráfego de request comum via `app_api`.

A tabela `permissoes` é um catálogo global (sem `empresaId`); tem apenas política de `SELECT` para `app_api` — escrita nela é uma operação administrativa (seed), não de request-time.

## Consequências

- O seed (`prisma/seed.ts`) deve rodar com privilégios de `prisma_migrator`/`DIRECT_URL`, não com `app_api`/`DATABASE_URL` — precisa inserir a empresa demo e o catálogo de permissões sem uma `empresaId` de sessão já definida.
- A Prisma Client Extension (Etapa 1) e o `TenantContext`/`AuthGuard` (Etapa 2) precisam, juntos, garantir que **toda** transação feita via `app_api` execute `SELECT set_config('app.empresa_id', $1, true)` antes de qualquer query — sem isso, as políticas de RLS negam tudo por padrão (fail closed), o que é o comportamento correto, mas precisa ser testado explicitamente.
- Rotação de senha dos papéis `app_api`/`prisma_migrator` é feita via SQL (`ALTER ROLE ... PASSWORD ...`), diferente de `postgres`, que exige o painel/Management API do Supabase.
- `.env.example` documenta os dois papéis; as senhas reais ficam apenas no `.env` (fora do controle de versão).
