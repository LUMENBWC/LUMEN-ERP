# Usuários & Permissões (Etapa 3)

## O que existe

**Backend (`apps/api/src/modules/usuarios` e `.../papeis`)**

Primeiro módulo de negócio "de verdade" do backend — estabelece o padrão de camadas que os módulos seguintes (Etapa 4+) devem seguir.

- **Camadas** (`modules/usuarios/{domain,application,infra,presentation}`):
  - `domain/`: `usuario.errors.ts` (erros de regra de negócio), `garantir-nao-remove-ultimo-administrador.ts` (regra pura, testada isoladamente), `papel-administrador.ts` (constante `PAPEL_ADMINISTRADOR`).
  - `application/`: `ports/usuarios.repository.port.ts` (interface — casos de uso nunca importam Prisma diretamente), `dto/*.ts` (schemas Zod), `use-cases/*.ts` (um arquivo por ação).
  - `infra/prisma-usuarios.repository.ts`: implementa a port. Instanciado por request via uma factory injetável (`USUARIOS_REPOSITORY_FACTORY`), não como singleton — precisa do `tx` já escopado por `runInTenantContext`.
  - `presentation/`: `usuarios.controller.ts`, `usuario-domain-error.filter.ts` (traduz os erros de domínio pra `{ code, message, details, traceId }`), `usuarios.module.ts`.
- **`modules/papeis`**: mesmas camadas, só leitura — `GET /papeis` (papéis da empresa com suas permissões) e `GET /permissoes` (catálogo global).
- **Testabilidade sem Postgres real**: use-cases dependem de `TenantTransactionRunner` (`infra/prisma/tenant-transaction-runner.ts`) em vez de chamar `runInTenantContext` direto. Em produção isso abre uma transação real; em teste, um fake runner só invoca a callback com um `tx` mockado — o repositório também é injetado via factory, então os 54 testes unitários do módulo (use-cases + regra de domínio + `ZodValidationPipe`) rodam sem tocar o banco.
- **Endpoints** (todos exigem `usuarios.gerenciar`, exceto atribuição/remoção de papel que exige `usuarios.gerenciarPermissoes`):
  - `POST /usuarios`, `GET /usuarios` (paginação/busca/filtro por papel/ordenação), `GET /usuarios/:id`, `PATCH /usuarios/:id`, `PATCH /usuarios/:id/ativo`.
  - `POST /usuarios/:id/papeis`, `DELETE /usuarios/:id/papeis/:papelId`.
- **Regras de negócio aplicadas** (`domain/`):
  - Não é possível desativar a própria conta (`NaoPodeDesativarASiMesmoError`).
  - Não é possível desativar o último usuário `ADMINISTRADOR` ativo, nem remover o papel `ADMINISTRADOR` do último administrador ativo (`UltimoAdministradorError`) — evita a empresa ficar sem ninguém capaz de gerenciar usuários.
  - `email` único por empresa, `authUserId` único globalmente (checagem prévia + captura do erro de constraint do Postgres como fallback).
- **Auditoria**: toda mutação grava em `AuditLog` (`common/audit/audit-log.service.ts`, reutilizável pelos módulos seguintes) dentro da mesma transação da operação.
- **Validação**: Zod, não `class-validator` — ver [ADR-0004](../decisions/ADR-0004-etapa3-usuarios-decisoes.md). `common/validation/zod-validation.pipe.ts` é o pipe reutilizável.

**Frontend (`apps/web/src/features/usuarios`)**

- `app/(dashboard)/usuarios/{page,novo/page,[id]/page}.tsx`: cada página checa `usuarios.gerenciar` no servidor (`lib/auth/require-permissao.server.ts`, via `/me`) antes de renderizar — mostra "Acesso negado" se faltar a permissão. O link "Usuários" no header do dashboard só aparece pra quem tem a permissão.
- `features/usuarios/api/`: `usuarios.api.ts`/`usuarios.queries.ts` (hooks TanStack Query — server state), `usuarios.types.ts`.
- `features/usuarios/schemas/usuario.schema.ts`: Zod espelhando os DTOs do backend (não é `packages/shared` de verdade ainda — isso só entra na Etapa 4, ver `docs/architecture.md`).
- `features/usuarios/store/usuarios-filtros.store.ts`: Zustand — estado de UI dos filtros/paginação da listagem (não é server state, por isso não é TanStack Query).
- `lib/api/client.ts`: equivalente client-side de `lib/api/server.ts` (que só funciona em Server Components) — necessário pros hooks do TanStack Query, que rodam no client.
- Componentes shadcn/ui novos: `input`, `label`, `table`, `badge`, `select`, `switch`, `dialog`, `pagination`.

## Decisões / limitações conhecidas

Ver [ADR-0004](../decisions/ADR-0004-etapa3-usuarios-decisoes.md) para o raciocínio completo. Resumo:

- **Criar usuário vincula um `authUserId` já existente no Supabase Auth** — não cria conta nova (isso exigiria `SUPABASE_SECRET_KEY`, propositalmente vazia até a Etapa 8). Não há convite por e-mail nem auto-cadastro ainda.
- **Validação passa a ser Zod** a partir desta etapa (a spec exige; `class-validator` era o que a Etapa 0 tinha scaffoldado). Módulos anteriores (`health`, `me`) não têm DTOs reais, então não precisaram de retrofit.
- **`usuarios`/`papeis` ganharam `createdById`/`updatedById`** nesta etapa (lacuna da Etapa 1). Demais tabelas herdadas da Etapa 1 ganham isso quando sua própria etapa for implementada.
- **CRUD de `Papel` em si não existe** — só atribuição/remoção dos papéis já seedados (`ADMINISTRADOR`, `GERENTE`, `FINANCEIRO`, `ESTOQUE`, `CAIXA`, `VENDEDOR`). A spec (Seção 3.9) só pede "atribuição de papel", não criação de papéis customizados.
- **`filialId` não aparece no formulário de criação** — a UI de filial fica para quando o módulo de Filiais existir (a spec já antecipa isso na Seção 1: "mesmo que a UI de filial venha depois").
- **Testes de integração contra Postgres real não foram escritos** — mesma decisão já registrada para `resolveTenantContext` na Etapa 2 (autenticacao-autorizacao.md); a cobertura aqui é toda unitária (use-cases com repositório/runner mockados + regra de domínio pura).
