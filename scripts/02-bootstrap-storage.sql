-- ===========================================================================
-- 02 - Bootstrap do Storage (rodar UMA vez por projeto Supabase)
-- ===========================================================================
--
-- Cria o bucket PRIVADO onde os PDFs de orçamento são gravados.
--
-- Por que isto existe: o bucket foi originalmente criado à mão no projeto de
-- desenvolvimento e nunca ficou versionado em lugar nenhum - nem em migration,
-- nem no README. Num ambiente novo isso é uma falha silenciosa: a API sobe
-- normalmente, e só quebra quando alguém clica em "Baixar PDF" num orçamento,
-- com "Falha ao salvar PDF no storage".
--
-- O bucket é PRIVADO de propósito. `apps/api/src/modules/orcamentos/infra/
-- supabase-pdf-storage.ts` acessa via createAdminClient() (SUPABASE_SECRET_KEY,
-- que bypassa RLS) e entrega ao usuário uma URL assinada de 5 minutos - o
-- objeto nunca é publicamente acessível.
--
-- Caminho dos objetos: <empresaId>/<orcamentoId>.pdf
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('orcamentos-pdf', 'orcamentos-pdf', false)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Conferência
-- ---------------------------------------------------------------------------
-- `public` PRECISA ser false.
SELECT id, name, public FROM storage.buckets WHERE id = 'orcamentos-pdf';
