# Endurecimento (Etapa 14)

## O que existe

Última etapa do MVP: sem módulo novo, o foco foi testar os fluxos críticos de ponta a ponta contra infraestrutura real (Postgres/RLS/RBAC, não mocks), auditar segurança multi-tenant, e fechar uma lacuna funcional que a auditoria revelou.

**Lacuna funcional fechada**: a conversão de orçamento em venda (spec Seção 3.5, referenciada desde a Etapa 8) nunca tinha sido implementada — o módulo `vendas` existe desde a Etapa 9, mas ninguém tinha voltado para o endpoint dedicado. `POST /vendas` agora aceita um `orcamentoId` opcional (ver [`pdv.md`](pdv.md) e [`orcamentos.md`](orcamentos.md) para os detalhes) - descoberto e corrigido durante a etapa, não algo planejado desde o início dela.

**Testes e2e (`apps/api/test`)** - Jest + Supertest, app real de ponta a ponta (todos os módulos, Postgres/RLS reais), rodam com `pnpm run test:e2e` (dentro de `apps/api`):

- `autenticacao.e2e-spec.ts` - fronteira de JWT real: sem token (401), token malformado (401), rota pública sem token (200), JWT genuíno do Supabase mas sem `Usuario` cadastrado (403) - prova que a verificação de assinatura contra o JWKS real funciona, distinto de token ausente/inválido.
- `venda-pdv.e2e-spec.ts` - fluxo completo de PDV: cria categoria/produto/entrada de estoque/abertura de caixa via HTTP, finaliza uma venda em dinheiro, confirma baixa de estoque, conta a receber quitada e movimento de caixa - tudo lido de volta via HTTP, não inspecionando o banco diretamente.
- `conversao-orcamento.e2e-spec.ts` - orçamento aprovado convertido em venda (itens/cliente reaproveitados, estoque baixado, status `CONVERTIDO`), rejeição de orçamento não aprovado, rejeição de conversão duplicada.
- `isolamento-multi-tenant.e2e-spec.ts` - produto do tenant A invisível para o tenant B mesmo pedindo o id diretamente (404, não 403 - a linha não "existe" pra fora do RLS), venda do tenant B não pode referenciar produto do tenant A, usuário sem nenhuma permissão bloqueado pelo `PermissionsGuard` (403).
- Infra reaproveitável em `apps/api/test/support/`: `seed-tenant.ts` (provisiona empresa+papel ADMINISTRADOR+usuário real do Supabase Auth), `bootstrap-app.ts`, `supabase-admin.ts`, `gerar-cpf-valido.ts`. Ver [ADR-0006](../decisions/ADR-0006-e2e-auth-teste-timeout-transacao.md) para a decisão de autenticação de teste (header dedicado no `SupabaseAuthGuard` real, só sob `NODE_ENV=test`) e o bump de timeout de transação do Prisma que os testes expuseram.

**Auditoria RLS**: releitura das duas migrations de RLS (`20260803005036_roles_rls_auth_fk`, `20260806013000_rls_null_guc_guard`) contra `TENANT_SCOPED_MODELS` (`apps/api/src/infra/prisma/tenant-scoped-models.ts`) - as 24 tabelas tenant-scoped têm `ENABLE ROW LEVEL SECURITY` + policy `tenant_isolation` com o guard `NULLIF(current_setting(...), '')::uuid` (ADR-0005). Nenhuma tabela faltando, nenhuma policy sem o guard.

**Auditoria RBAC**: toda rota de escrita em todo controller tem `@RequirePermissions`. As duas únicas exceções são intencionais: `GET /health` (`@Public()`, sem dado sensível) e `GET /me` (exige autenticação mas nenhuma permissão específica - qualquer usuário logado pode ver o próprio perfil/permissões).

**Prontidão de deploy**: `.env.example` já cobria todas as variáveis realmente lidas pelo código (`ConfigService`/`process.env`/consumidas internamente pelo `@supabase/server`) - nada faltando. `docker build -f docker/Dockerfile.api .` executado de verdade (Docker Desktop ativado no meio da sessão) - build multi-stage completo, container sobe, conecta no Postgres (`app_api`) e `GET /api/v1/health` responde 200. Confirma que `tsc` sem `rootDir` explícito infere `apps/api` como raiz comum de `src/` e `generated/`, então o `COPY --from=build .../dist` final carrega o cliente Prisma compilado junto, como esperado.

**Varredura de código morto**: sem `console.log`/`console.debug`/`console.warn`, `TODO`/`FIXME`, ou `@ts-ignore`/`@ts-nocheck` em nenhum dos dois apps.

**Bug de frontend encontrado em teste manual**: `OrcamentoForm` (`apps/web/src/features/orcamentos/components/orcamento-form.tsx`) passava `value={clienteId}` (de `watch('clienteId')`, sem default) pro `Select` do cliente - `undefined` no primeiro render, string depois de escolher um cliente, disparando o aviso do Base UI de componente trocando de não controlado para controlado. Corrigido para `value={clienteId || ''}`, mesmo padrão já usado no `Select` de produto do item logo abaixo. Conferidos todos os outros `Select` ligados a estado de formulário no app - nenhum outro tinha o mesmo problema (todos já tinham default definido).

**Auditoria final contra a especificação original** (releitura seção a seção do documento de spec contra o código real, não contra a memória de decisões já tomadas) - achou 4 pontos que tinham ficado pra trás, sem nenhum gap de arquitetura/segurança:

1. **Histórico de compras do cliente** - ver [`clientes.md`](clientes.md). Adiado corretamente na Etapa 6, nunca resgatado depois que Orçamentos/Vendas nasceram.
2. **Clientes inadimplentes** - ver [`financeiro.md`](financeiro.md). A spec pede "títulos vencidos **e** clientes inadimplentes"; só a primeira metade tinha sido feita.
3. **`inscricaoEstadual` em `Cliente`** - ver [`clientes.md`](clientes.md). `Produto` e `Empresa` já tinham campos fiscais mínimos, `Cliente` não tinha nenhum. Campo visível só para `tipoPessoa === 'JURIDICA'` no formulário.
4. **Ordenação inconsistente entre listagens** - `caixa` (sessões), `categorias`, `estoque` (movimentações), `financeiro` (contas a receber/pagar) e `vendas` não tinham `sortBy`/`sortDir` no DTO de listagem, só paginação e filtro; `clientes`/`fornecedores`/`orçamentos`/`produtos`/`usuários` já tinham desde as etapas em que foram criados. Adicionado nos 5 módulos que faltavam (backend: DTO Zod + `ListarXFiltro` do port + `orderBy` dinâmico no repositório; frontend: só os tipos/`buildQuery` declarando os parâmetros, sem UI de seleção de ordenação nova - **nenhum dos módulos "conformes" tinha esse controle na UI também**, então isso mantém paridade exata com o padrão já estabelecido, não introduz uma inconsistência nova entre "quem tem dropdown de ordenar e quem não tem").

## Decisões / limitações conhecidas

- **E2E dependem de credenciais reais do Supabase** (`SUPABASE_SECRET_KEY`) - sem elas, os specs de fluxo de negócio e autenticação são pulados automaticamente (`describe.skip`), não falham. Não há Postgres/Supabase local descartável neste projeto (mesma decisão já registrada no README desde a Etapa 1), então os e2e sempre rodam contra o mesmo banco de dev - usuários do Supabase Auth criados pelos testes são sempre removidos no `afterAll`, mas os dados de negócio (produtos, vendas, orçamentos) ficam nos tenants de teste dedicados (`documento` fixo por spec) e se acumulam entre execuções - mesmo comportamento já aceito para a empresa demo do seed.
- **Sem Playwright** - a especificação original pedia Playwright para e2e de UI; a cobertura desta etapa ficou nos e2e de API (mais barato, mais confiável, cobre a lógica de negócio e o isolamento multi-tenant de ponta a ponta sem depender de renderização de UI). Se e2e de navegador vierem a ser necessários, a ferramenta ainda precisa ser configurada do zero.
- **`--runInBand` obrigatório para os e2e** - rodar os specs em paralelo contra o Postgres remoto real do Supabase causava timeouts/desconexões intermitentes; sequencial é mais lento (~4min a suíte completa) mas confiável.
