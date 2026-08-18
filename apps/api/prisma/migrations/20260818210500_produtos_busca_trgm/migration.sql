-- Busca de produtos por "contains" (nome/SKU/codigo de barras ILIKE %termo%).
-- Sem trigram o %prefixo impede indice btree e o Postgres faz seq scan na
-- tabela de produtos. Os indices GIN com pg_trgm abaixo permitem combinar as
-- tres condicoes OR via bitmap index scan.
--
-- pg_trgm e uma extensao "trusted" (PG13+): um role com CREATE no banco a
-- instala sem superuser. No Supabase ela ja costuma estar disponivel; o
-- IF NOT EXISTS torna a criacao idempotente.
--
-- LOCK: o build dos indices GIN pega lock de escrita na tabela produtos
-- durante a construcao. Nos volumes atuais e rapido. Para ZERO downtime em
-- catalogos grandes, aplique manualmente com CREATE INDEX CONCURRENTLY (fora
-- de transacao) usando os mesmos nomes e marque com `migrate resolve --applied`.
--
-- Impacto de escrita: sao 3 indices GIN adicionais em produtos. Se o custo de
-- escrita pesar mais que a busca, os indices de sku/codigoBarras podem ser
-- removidos (do schema e do banco), mantendo apenas o de nome.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateIndex
CREATE INDEX "produtos_nome_idx" ON "produtos" USING GIN ("nome" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "produtos_sku_idx" ON "produtos" USING GIN ("sku" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "produtos_codigoBarras_idx" ON "produtos" USING GIN ("codigoBarras" gin_trgm_ops);
