# Núcleo / Multi-tenant (Etapa 1)

## O que existe

- **Schema Prisma completo** (`apps/api/prisma/schema.prisma`): núcleo/tenancy, produtos/estoque, parceiros, orçamentos, vendas, financeiro, caixa — 26 modelos, todos com `empresaId` (exceto `Empresa`, raiz do tenant, e `Permissao`, catálogo global), soft delete, timestamps e `createdById`/`updatedById` onde aplicável.
- **Migrations** (`apps/api/prisma/migrations/`):
  - `20260803004445_init` — schema completo + índices.
  - `20260803005036_roles_rls_auth_fk` — papéis `app_api`/`prisma_migrator`, RLS em todas as tabelas de negócio, FK `usuarios.authUserId -> auth.users`.
- **Papéis Postgres** (ver [ADR-0002](../decisions/ADR-0002-papeis-postgres-rls.md)): `app_api` (runtime, RLS aplicada) e `prisma_migrator` (migrations/seed, bypassa RLS).
- **`PrismaService`** (`apps/api/src/infra/prisma/prisma.service.ts`): client base conectado como `app_api` via `@prisma/adapter-pg`.
- **`runInTenantContext`** (`apps/api/src/infra/prisma/run-in-tenant-context.ts`): abre uma transação, define `app.empresa_id` (lido pelas policies de RLS) e devolve um client com a extensão de tenant aplicada. É o ponto de entrada que os módulos de negócio (Etapa 3+) devem usar para qualquer operação de request.
- **Extensão de tenant** (`tenant.extension.ts` + `inject-empresa-id.ts`): injeta/filtra `empresaId` automaticamente em toda query Prisma contra um modelo tenant-scoped — camada de aplicação, complementar ao RLS.
- **Seed** (`apps/api/prisma/seed.ts`): catálogo de permissões, empresa demo, 6 papéis padrão (ADMINISTRADOR, GERENTE, FINANCEIRO, ESTOQUE, CAIXA, VENDEDOR) com suas permissões. Roda como `prisma_migrator`. Criação do usuário admin demo é condicional a `SEED_ADMIN_AUTH_USER_ID` (depende de um usuário real no Supabase Auth — Etapa 2).

## Como rodar

```bash
pnpm --filter @erp/api exec prisma migrate deploy   # aplica migrations pendentes
pnpm --filter @erp/api exec prisma db seed          # popula permissões/papéis/empresa demo
```

`prisma generate` roda automaticamente via `postinstall` a cada `pnpm install`.

## Decisões / limitações conhecidas

- A extensão de tenant só escopa argumentos de topo (`where`/`data` diretos). Nested writes (criar um registro relacionado dentro de outro `create`) não são escopados automaticamente — precisam de `empresaId` explícito até haver um padrão documentado para isso.
- `empresas` não tem política de `INSERT`/`DELETE` para `app_api` — criação/remoção de empresa (provisionamento de tenant) ainda não tem um fluxo de aplicação definido; por ora só acontece via seed/`prisma_migrator`.
- `filialId` existe como coluna simples (indexada, sem relação Prisma) na maioria das tabelas de negócio — só `Usuario` e `CaixaSessao` têm relação completa com `Filial`. Ver ADR-0002 e a Seção 6 do documento de especificação original para o racional.
- Testado e confirmado que RLS nega por padrão sem `app.empresa_id` definido, isola corretamente entre empresas, e libera acesso com o valor certo (ver histórico de verificação na sessão que implementou esta etapa).
