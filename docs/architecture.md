# Arquitetura — ERP SaaS

## Visão geral

Monorepo (pnpm workspaces + Turborepo) com duas aplicações e pacotes compartilhados:

- `apps/web` — Next.js 15 (App Router), UI em shadcn/ui + Tailwind.
- `apps/api` — NestJS + Prisma, API REST versionada (`/api/v1`), documentada via Swagger.
- `packages/config` — ESLint, TypeScript e Prettier compartilhados entre as apps.
- `packages/shared` (a partir da Etapa 4+) — tipos e schemas Zod compartilhados entre front e back.

Banco de dados: **Supabase PostgreSQL** (único ambiente de dados, tanto em dev quanto em produção — não há Postgres local). Autenticação via **Supabase Auth**; a API valida o JWT via JWKS.

## Estilo arquitetural (backend)

Cada módulo de negócio em `apps/api/src/modules/<modulo>` segue Clean Architecture / DDD em 4 camadas:

- **domain/** — entidades, value objects, regras de negócio puras (sem dependência de framework).
- **application/** — casos de uso (services), portas (interfaces de repositório e de provedores externos), DTOs.
- **infra/** — implementações Prisma dos repositórios, adaptadores de provedores externos.
- **presentation/** — controllers NestJS, validação, Swagger.

Casos de uso dependem de **interfaces (ports)**, nunca diretamente do Prisma — isso é o Repository Pattern aplicado. Tudo que é externo (fiscal, pagamentos, mensageria, storage) segue Ports & Adapters.

## Multi-tenancy

Isolamento de dados por empresa em duas camadas de defesa:

1. **Aplicação:** um `TenantContext` (request-scoped) resolve `empresaId`/`filialId`/`usuarioId`/permissões a partir do JWT. Uma Prisma Client Extension injeta automaticamente `empresaId` em leituras e escritas dos models de negócio.
2. **Banco:** Row Level Security (RLS) no Postgres como defesa em profundidade, caso haja falha na camada de aplicação.

`empresaId` nunca é aceito vindo do cliente — é sempre derivado do token.

## Autenticação & Autorização

- Supabase Auth emite o JWT.
- `AuthGuard` valida o token (JWKS) e popula o `TenantContext`.
- `PermissionsGuard` + decorator `@RequirePermissions(...)` em cada rota — checagem por permissão granular, não apenas por papel (RBAC).

## Auditoria

Ações sensíveis (venda, movimentação de estoque, movimentação de caixa, alteração de permissão) geram registro em `AuditLog` (empresa, usuário, entidade, ação, dados antes/depois, IP, timestamp).

## Erros

Filtro de exceção global (`AllExceptionsFilter`) padroniza o corpo de erro: `{ code, message, details, traceId }`.

## Decisões travadas

Ver `docs/decisions/` para o histórico de ADRs. Resumo:

- IDs: UUID (nunca inteiro sequencial exposto).
- Dinheiro: `Decimal(14,2)` — nunca float.
- Datas: UTC no banco.
- Multi-tenancy: `empresaId` em toda tabela de negócio + Prisma Client Extension + RLS.

## Infraestrutura

- Frontend: deploy na **Vercel**.
- Backend: container Docker via **Coolify**.
- CI: GitHub Actions (lint, typecheck, test, build) em push/PR para `main`.
