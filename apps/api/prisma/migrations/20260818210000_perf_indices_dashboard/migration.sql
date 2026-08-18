-- Indices de performance para as agregacoes do Dashboard financeiro
-- (Onda 2 do trabalho de performance). Cada indice cobre um filtro ou
-- agrupamento que hoje faz seq scan:
--
--   * vendas(empresaId, status, createdAt)  -> faturamento/custo por periodo
--     (substitui vendas(empresaId, status), que vira prefixo deste)
--   * venda_itens(empresaId, produtoId)     -> "produtos mais vendidos" (groupBy)
--   * pagamentos_pagavel(empresaId, data)   -> soma de "despesas pagas"
--   * movimentos_caixa(empresaId, data)     -> entradas/saidas do fluxo de caixa
--
-- LOCK: os CREATE INDEX abaixo pegam um lock de escrita na tabela durante a
-- construcao. Nos volumes atuais e rapido (ms-s). Se as tabelas crescerem
-- muito e voce precisar de ZERO downtime, NAO rode esta migracao pelo
-- `migrate deploy`; em vez disso aplique manualmente, fora de transacao, com
-- `CREATE INDEX CONCURRENTLY` (mesmos nomes de indice) e depois marque a
-- migracao como aplicada com `prisma migrate resolve --applied`.

-- DropIndex
DROP INDEX "vendas_empresaId_status_idx";

-- CreateIndex
CREATE INDEX "vendas_empresaId_status_createdAt_idx" ON "vendas"("empresaId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "venda_itens_empresaId_produtoId_idx" ON "venda_itens"("empresaId", "produtoId");

-- CreateIndex
CREATE INDEX "pagamentos_pagavel_empresaId_data_idx" ON "pagamentos_pagavel"("empresaId", "data");

-- CreateIndex
CREATE INDEX "movimentos_caixa_empresaId_data_idx" ON "movimentos_caixa"("empresaId", "data");
