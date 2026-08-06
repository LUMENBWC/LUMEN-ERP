-- fornecedores ja tinha createdById/updatedById (colunas da migration init) mas
-- sem FK/relacao, mesma lacuna ja fechada para categorias/produtos/clientes
-- nas Etapas 5-6.

-- AddForeignKey
ALTER TABLE "fornecedores" ADD CONSTRAINT "fornecedores_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "fornecedores" ADD CONSTRAINT "fornecedores_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "fornecedores_createdById_idx" ON "fornecedores"("createdById");
CREATE INDEX "fornecedores_updatedById_idx" ON "fornecedores"("updatedById");
