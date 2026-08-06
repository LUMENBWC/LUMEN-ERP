-- orcamentos ja tinha createdById/updatedById (colunas da migration init) mas
-- sem FK/relacao, mesma lacuna ja fechada para categorias/produtos/clientes/
-- fornecedores nas Etapas 5-7.

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "orcamentos_createdById_idx" ON "orcamentos"("createdById");
CREATE INDEX "orcamentos_updatedById_idx" ON "orcamentos"("updatedById");
