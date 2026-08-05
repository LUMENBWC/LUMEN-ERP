# ADR-0003 — Pool dedicado para o bootstrap de identidade, por bug de multiplexação do Supavisor

- Status: aceito
- Data: 2026-08-04

## Contexto

Desde a Etapa 2, `GET /me` apresentava um 500 intermitente: `invalid input syntax for type uuid: ""`. O padrão era sempre o mesmo — a primeira requisição depois de um restart do processo funcionava, praticamente todas as seguintes falhavam. Foram descartadas, em ordem, várias hipóteses: bug no Prisma Client Extension, ordem de avaliação de CTE vs. RLS, pooler em modo transaction vs. session (porta 6543 vs. 5432), conexão idle derrubada sem handler de erro no `pg.Pool` (esse último era um bug real e foi corrigido, mas não era a causa deste sintoma).

A causa raiz só foi confirmada isolando `resolveTenantContext` da aplicação inteira — um script chamando a mesma sequência de queries diretamente contra o Postgres via `pg`, sem Prisma, sem HTTP — e testando cada variável isoladamente (centenas de execuções sequenciais e concorrentes por variante). O padrão determinístico encontrado:

- Uma transação que define **uma única** variável de sessão local (`SELECT set_config('app.x', $1, true)`) e lê ela de volta via RLS (`current_setting('app.x', true)`) — sempre funciona, indefinidamente.
- Uma transação que define **duas** variáveis de sessão locais com nomes diferentes (`app.auth_user_id` e `app.empresa_id`), em duas chamadas `set_config` separadas — funciona na primeira vez que aquela conexão física (mesmo `pg_backend_pid()`) é usada, e falha em praticamente todas as vezes seguintes, com o erro acima.
- O mesmo problema aparece mesmo usando duas transações separadas na mesma conexão (uma por variável), e mesmo depois de um restart completo do projeto no Supabase (ou seja, não é estado "sujo" residual — é reproduzível do zero).
- Definir as duas variáveis numa **única** chamada combinada (`SELECT set_config('app.a', $1, true), set_config('app.b', $2, true)`) funciona de forma confiável.
- Usar **dois pools `pg` completamente separados**, cada um dedicado a uma única variável pelo resto de sua vida (um pool só define `app.auth_user_id`, o outro só define `app.empresa_id`), também funciona de forma confiável — validado com 170+ execuções sequenciais e concorrentes sem nenhuma falha.

Isso indica um bug (ou comportamento não documentado) do Supavisor — o pooler da Supabase — na forma como multiplexa conexões: mesmo em modo "session" (porta 5432), `pg_backend_pid()` mostrado ao cliente foi idêntico em conexões que o `pg.Pool` tratava como distintas, e o reset de variáveis de sessão locais (`is_local = true`) entre reusos não está sendo feito corretamente quando mais de um nome de GUC customizado é usado no histórico daquele backend físico. Isso está fora do nosso controle de aplicação — é comportamento do lado do pooler hospedado pela Supabase.

## Decisão

`PrismaService` expõe dois pools `pg` distintos, cada um com uma única responsabilidade fixa pelo resto da vida do processo:

- **`pgPool`** — o pool principal, usado pelo Prisma Client (via `@prisma/adapter-pg`) para todo o tráfego de negócio. Único GUC que qualquer conexão desse pool jamais define: `app.empresa_id` (via `runInTenantContext` e a segunda etapa de `resolveTenantContext`).
- **`authBootstrapPool`** — pool pequeno (`max: 3`), usado exclusivamente pela primeira etapa de `resolveTenantContext` (resolver `usuarios` a partir do `authUserId` do JWT via a policy `self_lookup`). Único GUC que qualquer conexão desse pool jamais define: `app.auth_user_id`.

`resolveTenantContext` (`apps/api/src/common/tenant/resolve-tenant-context.ts`) foi dividido em duas transações independentes, cada uma no seu pool: `lookupUsuarioByAuthUserId` (em `authBootstrapPool`) e `lookupPapeisEPermissoes` (em `pgPool`).

## Consequências

- **Nenhum outro código deve usar `authBootstrapPool` para nada além de definir `app.auth_user_id`.** Se um caso de uso futuro precisar de uma terceira variável de sessão customizada, ela precisa do seu próprio pool dedicado, ou ser combinada com uma das duas existentes numa única chamada `set_config` — nunca uma terceira variável solta num pool que já tem outro nome de GUC em sua história.
- Isso é uma mitigação do lado da aplicação para um problema de infraestrutura da Supabase, não uma correção da causa raiz. Se a Supabase corrigir o Supavisor, esse workaround deixa de ser necessário, mas manter os pools separados continua sendo inofensivo (só usa mais algumas conexões ociosas).
- `resolveTenantContext` agora abre até duas conexões físicas por chamada (uma por pool) em vez de uma — custo aceitável dado o tamanho do projeto; se isso virar gargalo, vale revisitar.
- Se o mesmo sintoma (`invalid input syntax for type uuid: ""`, ou qualquer `current_setting()` retornando valor errado de forma intermitente) aparecer em outro fluxo que usa `set_config`, a primeira suspeita deve ser esta — não assumir que é um bug novo no código da aplicação sem antes verificar se duas variáveis de sessão diferentes estão sendo definidas na mesma conexão/pool.
