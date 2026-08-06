-- ADR-0005: root cause of the intermittent `invalid input syntax for type
-- uuid: ""` 500s. `current_setting(name, true)::uuid` only returns NULL
-- (safe) when the GUC was never set on that backend. If it was EVER set to
-- '' on that backend - by a raw/session-level SET, or by a client that
-- disconnected mid-transaction before its LOCAL set_config unwound - it
-- stays '' forever: RESET ALL/DISCARD ALL do not reset custom (placeholder)
-- GUCs, confirmed by direct testing against this project. Since Supavisor
-- reassigns backends across client sessions, any backend ever touched this
-- way is permanently poisoned for every RLS-gated query afterwards,
-- independent of any hygiene the application does on checkout.
-- `NULLIF(..., '')` folds that corrupted '' back to NULL before the cast,
-- restoring the fail-closed-on-unset behavior the policies were always
-- meant to have, regardless of what a given backend has seen before.
-- empresas
ALTER POLICY tenant_select ON "empresas" USING (id = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_update ON "empresas" USING (id = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK (id = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);

-- usuarios self_lookup
ALTER POLICY self_lookup ON "usuarios" USING ("authUserId" = NULLIF((select current_setting('app.auth_user_id', true)), '')::uuid);

-- tenant_isolation (empresaId-keyed tables)
ALTER POLICY tenant_isolation ON "filiais" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "usuarios" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "papeis" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "papel_permissoes" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "usuario_papeis" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "audit_logs" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "categorias" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "produtos" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "movimentacoes_estoque" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "clientes" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "fornecedores" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "fornecedor_produtos" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "orcamentos" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "orcamento_itens" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "vendas" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "venda_itens" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "venda_pagamentos" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "contas_receber" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "recebimentos_recebivel" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "categorias_despesa" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "contas_pagar" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "pagamentos_pagavel" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "caixa_sessoes" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
ALTER POLICY tenant_isolation ON "movimentos_caixa" USING ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid) WITH CHECK ("empresaId" = NULLIF((select current_setting('app.empresa_id', true)), '')::uuid);
