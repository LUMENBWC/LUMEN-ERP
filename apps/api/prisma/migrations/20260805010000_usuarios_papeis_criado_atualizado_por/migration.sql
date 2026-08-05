-- Closes a gap from Etapa 1: the spec's transversal rule (Secao 3) requires
-- createdById/updatedById on every business record. usuarios/papeis were
-- created before that was enforced; Etapa 3 (o modulo que passa a escrever
-- nessas duas tabelas via API) e o lugar natural para fechar a lacuna.
-- Nullable: o primeiro usuario/papel de uma empresa (seed) nao tem um
-- usuario "criador" anterior.

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN "createdById" UUID;
ALTER TABLE "usuarios" ADD COLUMN "updatedById" UUID;

-- AlterTable
ALTER TABLE "papeis" ADD COLUMN "createdById" UUID;
ALTER TABLE "papeis" ADD COLUMN "updatedById" UUID;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "papeis" ADD CONSTRAINT "papeis_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "papeis" ADD CONSTRAINT "papeis_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "usuarios_createdById_idx" ON "usuarios"("createdById");
CREATE INDEX "usuarios_updatedById_idx" ON "usuarios"("updatedById");
CREATE INDEX "papeis_createdById_idx" ON "papeis"("createdById");
CREATE INDEX "papeis_updatedById_idx" ON "papeis"("updatedById");
