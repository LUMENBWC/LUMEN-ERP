-- categorias/produtos already had createdById/updatedById columns (from the
-- init migration) but no FK/relation was ever defined - unlike
-- usuarios/papeis (20260805010000_usuarios_papeis_criado_atualizado_por),
-- which added the same columns AND wired up the relation. The produtos
-- repository's `include: { criadoPor, atualizadoPor }` was written against
-- the Usuario/Papel pattern without noticing Categoria/Produto never got
-- the equivalent FK, so Prisma throws "Unknown field `criadoPor`" - a
-- schema/relation gap, unrelated to ADR-0005's RLS bug.

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "produtos" ADD CONSTRAINT "produtos_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "categorias_createdById_idx" ON "categorias"("createdById");
CREATE INDEX "categorias_updatedById_idx" ON "categorias"("updatedById");
CREATE INDEX "produtos_createdById_idx" ON "produtos"("createdById");
CREATE INDEX "produtos_updatedById_idx" ON "produtos"("updatedById");
