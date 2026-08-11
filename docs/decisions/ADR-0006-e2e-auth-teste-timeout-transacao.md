# ADR-0006 — Autenticação de teste no `SupabaseAuthGuard` real + timeout de transação

- Status: aceito
- Data: 2026-08-10

## Contexto

A Etapa 14 (endurecimento) pedia testes e2e reais dos fluxos críticos (login, venda no PDV, conversão de orçamento, isolamento multi-tenant), batendo no Postgres/RLS de verdade — não mocks. O harness Jest+Supertest já existia (`apps/api/test`), mas só tinha um smoke test de `/health`.

O obstáculo: `SupabaseAuthGuard` é registrado globalmente via `APP_GUARD` (`{ provide: APP_GUARD, useClass: SupabaseAuthGuard }` em `auth.module.ts`), e cada spec de fluxo de negócio precisa autenticar como um usuário de um tenant de teste recém-provisionado — sem um JWT real assinado pelo Supabase para esse usuário.

**Primeira tentativa, descartada**: um `TestAuthGuard` separado + `Test.createTestingModule(...).overrideGuard(SupabaseAuthGuard).useClass(TestAuthGuard)`. Funciona em teoria segundo a documentação do NestJS, mas na prática **não teve efeito nenhum** — mesmo depois de registrar `SupabaseAuthGuard` sob o próprio token de classe (`providers: [SupabaseAuthGuard, { provide: APP_GUARD, useExisting: SupabaseAuthGuard }, ...]`) para tornar o override "visível", as requisições continuavam caindo no guard real (confirmado pelo stack trace do erro apontando pra `supabase-auth.guard.ts`, não `test-auth.guard.ts`). Não foi investigado a fundo o porquê exato (suspeita: guards globais via `APP_GUARD` são resolvidos num momento do bootstrap do `NestApplication` que não respeita override feito depois de `.compile()` de forma confiável nesta versão do Nest) — a causa raiz não importa tanto quanto o fato de o mecanismo não ser confiável aqui.

## Decisão

`SupabaseAuthGuard` passou a aceitar um header de teste (`x-test-auth-user-id`) como alternativa à verificação de JWT, **só quando `process.env.NODE_ENV === 'test'`** (setado automaticamente pelo Jest, nunca em produção). Uma requisição sem esse header segue o caminho normal de `verifyAuth` mesmo em teste — é assim que `autenticacao.e2e-spec.ts` continua testando a verificação de JWT real (assinatura válida contra o JWKS do Supabase) sem nenhum bypass.

```typescript
private async resolveAuthUserId(request: Request): Promise<string | undefined> {
  if (process.env.NODE_ENV === 'test') {
    const testAuthUserId = request.headers?.[TEST_AUTH_HEADER];
    if (typeof testAuthUserId === 'string' && testAuthUserId) {
      return testAuthUserId;
    }
  }
  // ...verifyAuth real, sem alteração
}
```

O resto do pipeline (`resolveTenantContext`, RLS via GUC, `PermissionsGuard`) continua **100% real e sem nenhum mock** — só a verificação de assinatura do JWT em si é substituível, e só sob `NODE_ENV=test` + header explícito.

Como `usuarios.authUserId` tem FK para `auth.users` (Supabase Auth), os specs de fluxo de negócio não podem inventar um UUID qualquer para esse header — `apps/api/test/support/seed-tenant.ts` cria um usuário real no Supabase Auth (`admin.auth.admin.createUser`, sem senha memorável, ninguém faz login com ele de verdade) para cada tenant de teste, e remove no `afterAll`. Exige `SUPABASE_SECRET_KEY` no `.env` — specs que dependem disso usam `describe.skip` automático quando a credencial não está disponível (`hasSupabaseAdminCredentials()`).

### Timeout de transação Prisma

Durante os testes do fluxo de conversão de orçamento, `POST /vendas` começou a falhar com `Transaction API error: ... timeout for this transaction was 5000ms`. O default do Prisma (`timeout: 5000`) é curto demais para `FinalizarVendaUseCase` quando a transação faz várias queries sequenciais sob latência de rede real (pooler do Supabase) — a conversão de orçamento soma mais duas queries (buscar o orçamento, atualizar seu status) às já existentes de uma venda normal (lock de produtos, criar venda, N deltas de estoque, movimento de caixa, audit log).

`runInTenantContext` (`apps/api/src/infra/prisma/run-in-tenant-context.ts`), usado por **toda** transação do projeto via `TenantTransactionRunner`, passou a usar `{ timeout: 15000, maxWait: 5000 }` em vez do default. É uma mudança de infraestrutura transversal, não específica de um módulo.

## Consequências

- Nenhum guard/mock de teste separado a manter — `SupabaseAuthGuard` é uma única implementação, real em produção, com um desvio estreito e explícito só sob `NODE_ENV=test`.
- Risco de segurança do desvio é mitigado por dois fatores independentes: `NODE_ENV` nunca é `"test"` fora de execução de teste (não é algo configurável via `.env` de produção), e o desvio só ativa se o _caller_ mandar o header — ausência do header preserva o comportamento de produção mesmo sob `NODE_ENV=test`.
- Qualquer novo spec e2e de fluxo de negócio deve seguir o mesmo padrão: `seedTenantAdministrador`/`seedUsuarioSemPermissoes` (`apps/api/test/support/seed-tenant.ts`) + header `TEST_AUTH_HEADER` exportado de `supabase-auth.guard.ts`.
- `apps/api/test/jest-e2e.json` precisou de dois ajustes de infraestrutura não relacionados ao guard: `NODE_OPTIONS=--experimental-vm-modules` (via `cross-env` no script `test:e2e`) porque o Prisma 7 carrega seu compilador de queries via `import()` dinâmico, e execução `--runInBand` porque rodar os specs em paralelo (workers concorrentes do Jest) contra o mesmo Postgres remoto causava timeouts/quedas de conexão intermitentes que não ocorrem em execução sequencial.
- O bump de timeout de transação vale para produção também, não só para os testes — sob latência de rede real (não só a do ambiente de teste), o mesmo timeout de 5s podia ter sido insuficiente para uma venda com muitos itens.
