-- clientes ja tinha createdById/updatedById (colunas da migration init) mas
-- sem FK/relacao, mesma lacuna ja fechada para categorias/produtos na Etapa 5
-- (20260806020000_produto_categoria_criado_atualizado_por).

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "clientes_createdById_idx" ON "clientes"("createdById");
CREATE INDEX "clientes_updatedById_idx" ON "clientes"("updatedById");
