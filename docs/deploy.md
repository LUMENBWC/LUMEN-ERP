# Deploy — LUMEN ERP

Runbook de publicação do MVP. Frontend na **Vercel**, backend em container via **Coolify**, banco no **Supabase**.

> **Leia a Seção 0 antes de qualquer coisa.** Há um item de segurança que precisa ser resolvido antes de existir ambiente de produção.

---

## 0 — Pré-requisito de segurança (bloqueante)

As senhas dos papéis Postgres `app_api` e `prisma_migrator` estiveram em texto puro na migration `20260803005036_roles_rls_auth_fk`, em um repositório **público**, desde 2026-08-02. **Trate-as como comprometidas.**

`prisma_migrator` tem `BYPASSRLS` — quem tiver essa senha lê e escreve dados de todos os tenants ignorando o Row Level Security.

Antes de subir produção:

1. **Rotacionar no projeto atual (dev)** — SQL Editor do Supabase:

   ```sql
   ALTER ROLE app_api WITH PASSWORD '<nova-senha-forte>';
   ALTER ROLE prisma_migrator WITH PASSWORD '<outra-nova-senha-forte>';
   ```

   Atualizar `DATABASE_URL` e `DIRECT_URL` no `.env` local.

2. **Não reutilizar** nenhuma dessas senhas no projeto de produção.

3. **Avaliar tornar o repositório privado.** O repo também expõe o desenho completo de RLS, permissões e papéis.

A migration já foi corrigida: os papéis passaram a ser criados **sem senha e de forma idempotente**, e a senha é definida por `scripts/01-bootstrap-roles.sql`, que você preenche na hora e não versiona preenchido.

---

## 1 — Provisionar o projeto Supabase de produção

Produção usa um **projeto Supabase próprio**, separado do de desenvolvimento. Isso não é preciosismo: os testes e2e rodam contra o banco de dev e deixam dados de negócio acumulados nos tenants de teste (ver `docs/modules/endurecimento.md`).

Ordem — **a ordem importa**:

### 1.1 Criar os papéis (antes de qualquer migration)

No SQL Editor do projeto novo, conectado como `postgres`, rode `scripts/01-bootstrap-roles.sql` com os placeholders de senha substituídos.

Por que antes: criando `prisma_migrator` primeiro, você aponta `DIRECT_URL` para ele já na primeira execução, e **todas as tabelas nascem sob `prisma_migrator`**. Isso elimina de saída o problema de ownership que, no projeto de dev, obrigou a aplicar vários `ALTER TABLE` por fora do Prisma (registrado em quase todos os `docs/modules/*.md`).

Confira a saída: `app_api` **precisa** aparecer com `rolbypassrls = false`.

### 1.2 Montar as connection strings

Pooler Supavisor em modo **SESSION** (não transaction — ver ADR-0002/ADR-0003):

```
DATABASE_URL = postgresql://app_api.<REF>:<SENHA_APP_API>@<HOST>:5432/postgres
DIRECT_URL   = postgresql://prisma_migrator.<REF>:<SENHA_MIGRATOR>@<HOST>:5432/postgres
```

### 1.3 Aplicar as migrations

```bash
pnpm --filter @erp/api exec prisma migrate deploy
```

### 1.4 Popular permissões, papéis e empresa

```bash
pnpm --filter @erp/api exec prisma db seed
```

Cria o catálogo de 22 permissões, os 6 papéis padrão e a empresa. Para criar o usuário administrador, crie a conta primeiro no Supabase Auth do projeto novo, copie o UUID, defina `SEED_ADMIN_AUTH_USER_ID=<uuid>` e rode o seed de novo.

### 1.5 Criar o bucket de PDFs

Rode `scripts/02-bootstrap-storage.sql`. Sem isso a API sobe normal e só quebra quando alguém clica em "Baixar PDF" num orçamento.

Confira: `public` **precisa** ser `false`.

### 1.6 Verificar o isolamento

Antes de liberar acesso, confirme que o RLS nega por padrão: uma query como `app_api` sem `app.empresa_id` definido não pode retornar linha nenhuma.

---

## 2 — Deploy da API (Coolify)

### 2.1 Imagem

```bash
docker build -f docker/Dockerfile.api -t lumen-erp-api:<tag> .
```

Build multi-stage validado. A imagem sai com ~1.18 GB — o stage `runtime` copia o `node_modules` inteiro, incluindo devDependencies. Não é bloqueador, mas é candidato óbvio a otimização (prune de produção).

O `HEALTHCHECK` já está declarado no Dockerfile, apontando para `/api/v1/health` (rota `@Public()`, não exige JWT). Configure o Coolify para usá-lo.

### 2.2 Variáveis de ambiente

| Variável                   | Obrigatória | Observação                                                                                             |
| -------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`             | ✅          | papel `app_api` (sem BYPASSRLS)                                                                        |
| `DIRECT_URL`               | ✅          | papel `prisma_migrator`, só migrations                                                                 |
| `SUPABASE_URL`             | ✅          |                                                                                                        |
| `SUPABASE_JWKS_URL`        | ✅          | verificação de JWT, sem segredo                                                                        |
| `SUPABASE_PUBLISHABLE_KEY` | ✅          |                                                                                                        |
| `SUPABASE_SECRET_KEY`      | ✅          | **necessária** para o Storage dos PDFs de orçamento                                                    |
| `CORS_ORIGINS`             | ✅          | domínio do front, ex. `https://app.seudominio.com.br`. **A API se recusa a subir em produção sem ela** |
| `NODE_ENV`                 | ✅          | `production`                                                                                           |
| `PORT`                     | —           | default 3001                                                                                           |
| `DB_POOL_MAX`              | —           | default 8 — ver 2.3                                                                                    |
| `DB_AUTH_POOL_MAX`         | —           | default 2 — ver 2.3                                                                                    |
| `ENABLE_SWAGGER`           | —           | deixe **desligada**; o Swagger publica o mapa completo de rotas e permissões                           |

### 2.3 Réplicas e limite de conexões ⚠️

O Supavisor em modo session limita clientes do **projeto inteiro** (`pool_size`, tipicamente 15 no plano free) — não por processo. Some todas as réplicas da API, Prisma Studio, migrations e e2e.

```
(DB_POOL_MAX + DB_AUTH_POOL_MAX) × réplicas  <<  pool_size do projeto
```

Com o default (8 + 2 = 10), **uma** réplica cabe folgado em 15; **duas** já estouram. Antes de escalar, confirme o `pool_size` do plano de produção e ajuste `DB_POOL_MAX`. Estourar dá `(EMAXCONNSESSION) max clients reached in session mode` — que se manifesta como 500 em `/me` e no dashboard, não como erro de conexão óbvio.

Se precisar de mais réplicas do que o teto permite, a saída seria o modo **transaction** do pooler — mas isso é incompatível com o desenho atual de GUC por sessão (ADR-0002/ADR-0003). Seria mudança de arquitetura, não de configuração.

### 2.4 Migrations no deploy

O container **não** roda migrations — o `CMD` só sobe a API. Rode `prisma migrate deploy` como **passo separado** (job/pré-deploy no Coolify), usando `DIRECT_URL`:

```bash
pnpm --filter @erp/api exec prisma migrate deploy
```

Nunca coloque isso no `CMD`: com múltiplas réplicas, todas tentariam migrar ao mesmo tempo.

> **Nota sobre o banco de dev.** A migration `20260803005036_roles_rls_auth_fk` foi editada para remover os segredos, então seu checksum mudou. Em banco novo aplica limpo. No banco de dev, onde ela **já está aplicada**, o `migrate deploy` vai acusar migration modificada. Resolva atualizando o checksum registrado em `_prisma_migrations` para esse arquivo, ou recrie o ambiente de dev do zero pelo mesmo runbook.

---

## 3 — Deploy do front (Vercel)

### 3.1 Configuração do projeto

Como é um monorepo pnpm:

- **Root Directory:** `apps/web`
- **Framework Preset:** Next.js
- **Install Command:** `pnpm install` (na raiz do monorepo)

### 3.2 Variáveis de ambiente ⚠️

`apps/web/next.config.ts` carrega o `.env` da **raiz do repositório** via dotenv. **Esse arquivo não existe na Vercel.** As três variáveis abaixo precisam estar definidas no painel da Vercel, ou o build inlina `undefined` e a aplicação quebra em runtime:

| Variável                               | Valor                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | URL do projeto Supabase de **produção**                                  |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | chave publishable de produção                                            |
| `NEXT_PUBLIC_API_URL`                  | URL pública da API + prefixo, ex. `https://api.seudominio.com.br/api/v1` |

Lembre que `NEXT_PUBLIC_*` é **inlinado no bundle e público**. Nunca coloque `SUPABASE_SECRET_KEY` aqui.

### 3.3 Ordem

Faça o deploy da API **primeiro** e confirme `/api/v1/health`. O front chama a API durante o render no servidor (`apiFetch('/me')` no layout do dashboard); com a API fora do ar, o Next.js devolve erro de servidor em vez de degradar.

---

## 4 — Verificação pós-deploy

| #   | Verificação                        | Esperado                                            |
| --- | ---------------------------------- | --------------------------------------------------- |
| 1   | `GET <api>/api/v1/health`          | `200 {"status":"ok"}`                               |
| 2   | `GET <api>/api/v1/docs`            | **404** em produção                                 |
| 3   | `GET <api>/api/v1/me` sem token    | `401`                                               |
| 4   | CORS de origem não autorizada      | bloqueado                                           |
| 5   | Login pelo front                   | redireciona para `/dashboard`                       |
| 6   | Navegação lateral                  | só os itens das permissões do papel                 |
| 7   | Criar produto → entrada de estoque | `estoqueAtual` sobe, custo médio recalculado        |
| 8   | Abrir caixa → venda em dinheiro    | baixa estoque + título quitado + movimento de caixa |
| 9   | Orçamento → aprovar → converter    | venda criada, orçamento vira `CONVERTIDO`           |
| 10  | Baixar PDF de orçamento            | abre URL assinada (valida o bucket)                 |
| 11  | Valores monetários                 | `R$ 1.234,50` — nunca `R$ 1234.5`                   |
| 12  | Isolamento entre empresas          | dado de outro tenant retorna 404                    |

---

## 5 — Pendências conhecidas antes de dizer "MVP no ar"

- **Rotação das credenciais** (Seção 0) — bloqueante.
- **Réplica única** até confirmar o `pool_size` do plano (Seção 2.3).
- **Sem tratamento de falha da API no front:** o layout do dashboard chama `apiFetch('/me')` sem try/catch. Se a API cair, o usuário vê a tela de erro crua do Next.js em vez de uma mensagem tratada. Não bloqueia o deploy, mas é a primeira coisa que aparece num incidente.
- **Sem numeração sequencial** de orçamento e venda — a identificação é por cliente + data.
- **Sem log de auditoria na UI:** o `AuditLog` é escrito por todos os módulos e a permissão `auditoria.ler` existe, mas não há endpoint nem tela.
- **Imagem Docker de 1.18 GB** — otimização pendente.
