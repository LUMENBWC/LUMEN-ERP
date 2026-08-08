-- contas_pagar ja tinha createdById/updatedById (colunas da migration init) mas
-- sem FK/relacao, mesma lacuna ja fechada para categorias/produtos/clientes/
-- fornecedores/orcamentos nas Etapas 5-8.

-- AddForeignKey
ALTER TABLE "contas_pagar" ADD CONSTRAINT "contas_pagar_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contas_pagar" ADD CONSTRAINT "contas_pagar_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "contas_pagar_createdById_idx" ON "contas_pagar"("createdById");
CREATE INDEX "contas_pagar_updatedById_idx" ON "contas_pagar"("updatedById");
