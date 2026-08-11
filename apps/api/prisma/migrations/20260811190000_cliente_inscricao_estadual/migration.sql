-- Campo fiscal minimo em Cliente (spec Secao 3.10 - "ex.: ... inscricao
-- estadual" em produto/empresa/cliente). Produto ja tem ncm/cfop/cst,
-- Empresa ja tem regimeTributario/inscricaoEstadual; faltava o equivalente
-- do lado do destinatario (cliente), relevante para calculo de ICMS/emissao
-- fiscal quando o FiscalProvider (Etapa 13) for implementado de verdade.
ALTER TABLE "clientes" ADD COLUMN "inscricaoEstadual" TEXT;
