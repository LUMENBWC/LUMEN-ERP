# ERP DA LUMEN

ERP SaaS multiempresa para pequenas e médias empresas — produtos, estoque, clientes, fornecedores, orçamentos, PDV, financeiro, caixa e usuários/permissões.

Ver a especificação completa e o plano de etapas em `docs/architecture.md` e `docs/decisions/`.

## Progresso

- ✅ Etapa 0 — Fundação (monorepo, CI, Docker)
- ✅ Etapa 1 — Banco & Núcleo Multi-tenant ([docs](docs/modules/nucleo-multitenant.md))
- ✅ Etapa 2 — Autenticação & Autorização ([docs](docs/modules/autenticacao-autorizacao.md))
- ✅ Etapa 3 — Usuários & Permissões ([docs](docs/modules/usuarios.md))
- ✅ Etapa 4 — Produtos & Categorias ([docs](docs/modules/produtos.md))
- ✅ Etapa 5 — Estoque (Movimentações) ([docs](docs/modules/estoque.md))
- ✅ Etapa 6 — Clientes ([docs](docs/modules/clientes.md))
- ✅ Etapa 7 — Fornecedores ([docs](docs/modules/fornecedores.md))
- ✅ Etapa 8 — Orçamentos ([docs](docs/modules/orcamentos.md))
- ✅ Etapa 9 — PDV / Frente de Caixa ([docs](docs/modules/pdv.md))
- ✅ Etapa 10 — Caixa ([docs](docs/modules/caixa.md))
- ✅ Etapa 11 — Financeiro ([docs](docs/modules/financeiro.md))
- ⬜ Etapa 12 — Dashboard

## Stack

- **Frontend** (`apps/web`): Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, React Hook Form, Zod.
- **Backend** (`apps/api`): NestJS, TypeScript, Prisma ORM, Swagger.
- **Banco de dados**: Supabase PostgreSQL (mesmo banco em dev e produção — sem Postgres local).
- **Infra**: Docker, GitHub Actions (CI), deploy do frontend na Vercel e do backend via Coolify.

## Requisitos

- Node.js >= 22
- pnpm (via `corepack enable`)
- Um projeto Supabase (URL + chaves) — ver `.env.example`

## Como rodar

```bash
pnpm install
cp .env.example .env   # preencha com as credenciais do seu projeto Supabase
pnpm dev                # sobe apps/web e apps/api em paralelo
```

- Web: http://localhost:3000
- API: http://localhost:3001/api/v1 (health-check em `/api/v1/health`, docs em `/api/v1/docs`)

### Banco de dados (primeira vez)

```bash
pnpm --filter @erp/api exec prisma migrate deploy   # aplica as migrations
pnpm --filter @erp/api exec prisma db seed          # popula permissões, papéis e empresa demo
```

Ver `docs/modules/nucleo-multitenant.md` e [ADR-0002](docs/decisions/ADR-0002-papeis-postgres-rls.md) para o racional de `app_api`/`prisma_migrator` e RLS.

## Scripts

| Script           | Descrição                                  |
| ---------------- | ------------------------------------------ |
| `pnpm dev`       | Sobe todas as apps em modo desenvolvimento |
| `pnpm build`     | Build de produção de todas as apps         |
| `pnpm lint`      | Lint em todo o monorepo                    |
| `pnpm typecheck` | Checagem de tipos em todo o monorepo       |
| `pnpm test`      | Testes de todas as apps                    |

## Estrutura

```
apps/
  web/      # Next.js 15
  api/      # NestJS
packages/
  config/   # ESLint, TypeScript e Prettier compartilhados
docs/
  architecture.md
  decisions/   # ADRs
docker/
  Dockerfile.api
  docker-compose.yml
```

## Docker (API)

```bash
docker compose -f docker/docker-compose.yml up --build
```
