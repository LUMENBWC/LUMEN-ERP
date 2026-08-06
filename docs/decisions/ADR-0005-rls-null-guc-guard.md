# ADR-0005 — Políticas RLS blindadas contra GUC customizado corrompido para `''`

- Status: aceito
- Data: 2026-08-06

## Contexto

Mesmo depois da separação de pools por GUC (ADR-0003), o mesmo sintoma voltou durante a Etapa 4: `GET /me` e `POST /categorias`/`POST /produtos` falhando de forma intermitente com `invalid input syntax for type uuid: ""`, agora incluindo o próprio bootstrap de autenticação (`lookupUsuarioByAuthUserId`), não só o caminho de negócio.

Duas hipóteses foram investigadas e descartadas nesta sessão antes da causa real:

1. **`'acquire'` do `pg.Pool` disparando `DISCARD ALL` de forma fire-and-forget.** Validado em isolamento (23/23), mas provado não confiável ao vivo via log de diagnóstico: o `DISCARD ALL` completava, e a query seguinte do próprio chamador ainda falhava — sem garantia de ordenação entre o listener e o código do chamador na mesma conexão.
2. **Reuso de backend do Supavisor após um gap de inatividade sem reset de sessão**, corrigido tentando `await client.query('DISCARD ALL')` explícito, antes do `BEGIN`, tanto em `resolveTenantContext.ts` quanto (via warmup + `$transaction`) em `run-in-tenant-context.ts`. Essa mudança é correta e permanece no código como higiene de conexão, mas **não eliminou o bug** — testado com scripts diretos contra o Supavisor real (idle de 25s/45s, chamadas em série, chamadas concorrentes), a falha continuava aparecendo, e de forma não-determinística: a mesma sequência de código passava 20/20 vezes e falhava 5/5 vezes dependendo unicamente de qual backend físico o Supavisor entregava.

A causa raiz real foi isolada testando diretamente contra o Postgres:

```sql
SET app.empresa_id = '';
SELECT current_setting('app.empresa_id', true);  -- ''
DISCARD ALL;
SELECT current_setting('app.empresa_id', true);  -- ainda ''
```

**`RESET ALL` (e portanto `DISCARD ALL`, que o inclui) não reseta GUCs customizados (placeholder) para `NULL`** — eles não têm um "default" registrado por nenhuma extensão, então não há para onde resetar. Uma vez que um GUC customizado é definido como `''` numa conexão física — por um `SET` não-local em qualquer código (passado ou presente), ou por um cliente que caiu no meio de uma transação antes do `set_config(..., true)` desfazer — **aquela conexão fica permanentemente contaminada**, e nenhuma higiene do lado do cliente (`DISCARD ALL`, `RESET ALL`, nova transação) desfaz isso.

Como o Supavisor reatribui conexões físicas entre sessões de cliente diferentes (mesmo no pooler "session", porta 5432 — ver ADR-0003), qualquer conexão que já tenha sido contaminada uma vez continua contaminada para sempre, para qualquer cliente futuro que a receber — incluindo o próprio processo corrigido, testado do zero. As policies RLS assumiam que `current_setting(nome, true)` só retorna `NULL` (seguro) ou o valor esperado; na prática, uma terceira possibilidade sempre existiu — `''` de uma conexão contaminada — e `''::uuid` lança erro em vez de simplesmente "não bater" no `WHERE`.

Confirmado que a correção abaixo resolve isso mesmo numa conexão **deliberadamente contaminada e sem nenhum `DISCARD ALL`**:

```sql
SET app.empresa_id = '';
SET app.auth_user_id = '';
BEGIN;
SELECT set_config('app.auth_user_id', '<uuid real>', true);
SELECT id, "empresaId" FROM usuarios WHERE "authUserId" = '<uuid real>'::uuid AND ativo = true;
-- funciona normalmente, mesmo com app.empresa_id ainda == ''
```

## Decisão

Toda policy RLS que faz `current_setting('app.x', true)::uuid` passou a envolver a leitura em `NULLIF(..., '')` antes do cast:

```sql
NULLIF((select current_setting('app.empresa_id', true)), '')::uuid
```

Isso dobra um `''` corrompido de volta para `NULL` antes do cast, restaurando o comportamento "fail closed quando não definido" que as policies sempre pretenderam ter (ver comentário original na migração `20260803005036_roles_rls_auth_fk`), independente do histórico daquela conexão física. Aplicado em `20260806013000_rls_null_guc_guard` a: `empresas` (`tenant_select`, `tenant_update`), `usuarios` (`self_lookup`, `tenant_isolation`) e todas as demais tabelas com policy `tenant_isolation`.

A migração precisou ser aplicada via MCP do Supabase (papel `postgres`) — nem `app_api` nem `prisma_migrator` têm privilégio de `ALTER POLICY` sem ser dono da tabela.

## Consequências

- **Esta é a correção definitiva** para o sintoma `invalid input syntax for type uuid: ""` — ao contrário de ADR-0003 (mitigação de infraestrutura) e da higiene `DISCARD ALL` (necessária mas insuficiente, ver acima), esta correção é robusta independente de qualquer comportamento do pooler, de quantos GUCs diferentes uma conexão já viu, ou de quantas vezes uma conexão foi reaproveitada.
- `DISCARD ALL` explícito antes do `BEGIN` (`resolveTenantContext.ts`, `run-in-tenant-context.ts`) permanece no código — é boa higiene para planos preparados, locks consultivos, `LISTEN`, temp tables etc. — mas não deve ser tratado como proteção contra este sintoma especificamente. O listener `'acquire'` fire-and-forget foi removido de `PrismaService` por não ser confiável (item 1 acima).
- Qualquer política RLS nova (novos módulos) que faça cast de `current_setting(...)` para `uuid` (ou qualquer tipo que não aceite `''`) **deve** usar o padrão `NULLIF(..., '')` desde o início — não copiar o padrão antigo sem o guard.
- Não é preciso reiniciar o processo da API para esta correção — é uma mudança apenas no banco (RLS), efetiva imediatamente para novas transações.
