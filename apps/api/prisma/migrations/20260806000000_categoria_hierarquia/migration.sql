-- Etapa 4 (spec Secao 3.1): "Categorias de produto (CRUD, hierarquia
-- simples de 1 nivel no MVP)". A validacao de que so 1 nivel e permitido
-- (uma subcategoria nao pode ter suas proprias subcategorias) fica na
-- camada de aplicacao (modules/categorias/domain), nao no banco.

ALTER TABLE "categorias" ADD COLUMN "categoriaPaiId" UUID;

ALTER TABLE "categorias" ADD CONSTRAINT "categorias_categoriaPaiId_fkey" FOREIGN KEY ("categoriaPaiId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "categorias_categoriaPaiId_idx" ON "categorias"("categoriaPaiId");
