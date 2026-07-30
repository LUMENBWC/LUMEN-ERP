# ADR-0001 — Stack e arquitetura base

- Status: aceito
- Data: 2026-07-29

## Contexto

Início do desenvolvimento do ERP SaaS multiempresa. É preciso fixar a stack e as decisões arquiteturais estruturais antes de implementar qualquer módulo de negócio, para que todo o time (e o agente de desenvolvimento) trabalhe sobre as mesmas bases.

## Decisão

- **Monorepo**: pnpm workspaces + Turborepo, com `apps/web`, `apps/api` e `packages/*`.
- **Frontend**: Next.js 15 (App Router) + React + TypeScript + Tailwind CSS + shadcn/ui + TanStack Query + Zustand + React Hook Form + Zod.
- **Backend**: NestJS + TypeScript + Prisma ORM, API REST versionada em `/api/v1`, documentada via Swagger/OpenAPI.
- **Banco de dados**: Supabase PostgreSQL — único banco, usado tanto em desenvolvimento quanto em produção (sem Postgres local em container). Migrations via Prisma Migrate; RLS habilitada como segunda camada de isolamento multi-tenant.
- **Autenticação**: Supabase Auth emite o JWT; a API valida via JWKS.
- **Storage**: Supabase Storage.
- **Infra**: Docker (apenas para a API), GitHub Actions para CI, deploy do frontend na Vercel e do backend via Coolify.
- **Arquitetura de backend**: Clean Architecture / DDD por módulo (domain/application/infra/presentation), Repository Pattern, Ports & Adapters para integrações externas.
- **Multi-tenancy**: `empresaId` como discriminador em toda tabela de negócio, injetado automaticamente via Prisma Client Extension a partir do `TenantContext` (nunca aceito do cliente), reforçado por RLS no Postgres.
- **Dinheiro**: sempre `Decimal(14,2)`, nunca `float`/`number`.
- **IDs**: UUID, nunca inteiro sequencial exposto.

## Alternativas consideradas

- **Postgres local via Docker Compose em dev**: descartado — o time decidiu usar o Supabase remoto tanto em dev quanto em produção, evitando divergência de schema/RLS entre ambientes e reduzindo a superfície de infraestrutura local.
- **Multi-tenancy via schema-per-tenant**: descartado para o MVP por complexidade operacional; discriminador `empresaId` + RLS é suficiente para a escala inicial (milhares de empresas em um único schema).

## Consequências

- Todo desenvolvimento local depende de credenciais de um projeto Supabase (não há ambiente 100% offline). O `.env.example` documenta as variáveis necessárias.
- A ausência de Postgres local simplifica o `docker-compose.yml` (contém apenas o serviço da API).
- Migrations e RLS devem ser testadas contra o Supabase real (ou um projeto Supabase de desenvolvimento dedicado), não contra um Postgres genérico.
