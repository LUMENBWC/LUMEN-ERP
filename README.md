# ERP DA LUMEN

ERP SaaS multiempresa para pequenas e médias empresas — produtos, estoque, clientes, fornecedores, orçamentos, PDV, financeiro, caixa e usuários/permissões.

Ver a especificação completa e o plano de etapas em `docs/architecture.md` e `docs/decisions/`.

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

## Scripts

| Script            | Descrição                                      |
| ----------------- | ----------------------------------------------- |
| `pnpm dev`        | Sobe todas as apps em modo desenvolvimento       |
| `pnpm build`      | Build de produção de todas as apps               |
| `pnpm lint`       | Lint em todo o monorepo                          |
| `pnpm typecheck`  | Checagem de tipos em todo o monorepo             |
| `pnpm test`       | Testes de todas as apps                          |

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
