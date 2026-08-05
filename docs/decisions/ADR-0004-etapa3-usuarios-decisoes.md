# ADR-0004 — Decisões de implementação da Etapa 3 (Usuários & Permissões)

- Status: aceito
- Data: 2026-08-05

## Contexto

A Etapa 3 é o primeiro módulo de negócio "de verdade" do backend (os anteriores — `health`, `me` — são bootstrap, sem DTOs reais nem camadas). Três pontos precisavam de uma decisão explícita antes de codar.

## Decisão 1 — Validação de entrada: Zod, não `class-validator`

A especificação (Seção 4 e 8) exige "Validação com Zod compartilhada: o mesmo schema valida no front (React Hook Form) e no back (pipe NestJS)". A Etapa 0, porém, scaffoldou `apps/api` com `class-validator`/`class-transformer` (o padrão default do NestJS) — `main.ts` já registra um `ValidationPipe` global baseado nele.

A partir da Etapa 3, todo DTO de entrada novo usa **Zod** (`common/validation/zod-validation.pipe.ts`, aplicado via `@UsePipes` por rota/controller), conforme a spec. O `ValidationPipe` (class-validator) global em `main.ts` continua registrado — não é usado por nenhum DTO novo, mas removê-lo não traz benefício e os módulos `health`/`me` não têm DTOs reais para migrar. Não há retrofit dos módulos anteriores: não têm DTOs de entrada que justifiquem a mudança.

`packages/shared` (schemas Zod realmente compartilhados entre `apps/api` e `apps/web`) continua fora de escopo até a Etapa 4+, conforme já registrado em `docs/architecture.md`. Por enquanto, os schemas Zod do backend (`modules/usuarios/application/dto`) e do frontend (`features/usuarios/schemas`) são espelhados manualmente — mesmo padrão já usado pela tela de login (Etapa 2).

## Decisão 2 — "Criar usuário" vincula um `authUserId` já existente, não cria conta no Supabase Auth

Criar uma conta nova no Supabase Auth via API exigiria o client admin (`supabaseAdmin`, que precisa de `SUPABASE_SECRET_KEY`). Essa chave está deliberadamente vazia até a Etapa 8 (Storage) — ver `docs/modules/autenticacao-autorizacao.md`.

`POST /api/v1/usuarios` recebe `authUserId` (UUID de uma conta já existente no Supabase Auth), `nome`, `email` e `filialId?`, e cria o vínculo `usuarios` + atribuição de papel inicial — o mesmo padrão que `prisma/seed.ts` já usa para o admin demo (`SEED_ADMIN_AUTH_USER_ID`), só que via API em vez de script. A pessoa precisa já ter uma conta no Supabase Auth (hoje, criada manualmente pelo painel do Supabase) antes de o Administrador conseguir "criar o usuário" no ERP.

**Consequência:** não há fluxo de convite por e-mail nem de auto-cadastro na Etapa 3. Isso é uma limitação conhecida, não um esquecimento — fica registrado aqui para não ser reaberto sem necessidade, e para ser revisitado quando `SUPABASE_SECRET_KEY` entrar em uso (Etapa 8) ou se um fluxo de convite virar requisito explícito.

## Decisão 3 — `usuarios`/`papeis` ganham `createdById`/`updatedById` nesta etapa

A regra transversal da Seção 3 da spec exige `createdById`/`updatedById` em todo registro de negócio; `usuarios` e `papeis` foram criados na Etapa 1 sem esses campos. Como a Etapa 3 é o módulo dono dessas duas tabelas, fechar essa lacuna aqui (migration `20260805010000_usuarios_papeis_criado_atualizado_por`) é mais natural do que carregar a dívida adiante. Ambos os campos são `nullable` + `ON DELETE SET NULL` (auto-relacionamento em `Usuario`): o primeiro usuário/papel de uma empresa (seed) não tem um usuário "criador" anterior.

**Não** houve retrofit das demais tabelas criadas na Etapa 1 (`Categoria`, `Produto`, etc.) — cada uma ganha `createdById`/`updatedById` quando sua própria etapa (4+) for implementada, pelo mesmo raciocínio.

**Nota operacional:** `usuarios`/`papeis` (e as demais tabelas do `init`) são de propriedade do role `postgres`, não do `prisma_migrator` — a migration de roles (ADR-0002) rodou depois da migration `init`, então `prisma_migrator` nunca foi dono dessas tabelas. `ALTER TABLE` nelas exige o MCP da Supabase (ou o SQL Editor do painel), não `prisma migrate dev/deploy` (que falha com "must be owner of table" via `DIRECT_URL`/`prisma_migrator`). A migration ainda é registrada normalmente em `prisma/migrations/` e marcada como aplicada via `prisma migrate resolve --applied` depois de rodar o SQL pelo MCP.
