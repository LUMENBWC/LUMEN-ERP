-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TipoPessoa" AS ENUM ('FISICA', 'JURIDICA');

-- CreateEnum
CREATE TYPE "UnidadeMedida" AS ENUM ('UN', 'KG', 'G', 'L', 'ML', 'M', 'CX', 'PC');

-- CreateEnum
CREATE TYPE "TipoMovimentacaoEstoque" AS ENUM ('ENTRADA_COMPRA', 'SAIDA_VENDA', 'AJUSTE_MANUAL', 'PERDA');

-- CreateEnum
CREATE TYPE "StatusOrcamento" AS ENUM ('RASCUNHO', 'ENVIADO', 'APROVADO', 'RECUSADO', 'EXPIRADO', 'CONVERTIDO');

-- CreateEnum
CREATE TYPE "StatusVenda" AS ENUM ('CONCLUIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('DINHEIRO', 'PIX', 'DEBITO', 'CREDITO', 'CREDITO_PARCELADO', 'A_PRAZO');

-- CreateEnum
CREATE TYPE "StatusConta" AS ENUM ('ABERTO', 'PAGO', 'PARCIAL', 'VENCIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "StatusCaixaSessao" AS ENUM ('ABERTO', 'FECHADO');

-- CreateEnum
CREATE TYPE "TipoMovimentoCaixa" AS ENUM ('ABERTURA', 'SUPRIMENTO', 'SANGRIA', 'VENDA', 'FECHAMENTO');

-- CreateTable
CREATE TABLE "empresas" (
    "id" UUID NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "documento" TEXT NOT NULL,
    "regimeTributario" TEXT,
    "inscricaoEstadual" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" VARCHAR(2),
    "cep" TEXT,
    "plano" TEXT NOT NULL DEFAULT 'trial',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filiais" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "documento" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" VARCHAR(2),
    "cep" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "filiais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "filialId" UUID,
    "authUserId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "papeis" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "papeis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissoes" (
    "id" UUID NOT NULL,
    "chave" TEXT NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "papel_permissoes" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "papelId" UUID NOT NULL,
    "permissaoId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "papel_permissoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_papeis" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "papelId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_papeis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "usuarioId" UUID,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "dadosAntes" JSONB,
    "dadosDepois" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "filialId" UUID,
    "categoriaId" UUID,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "sku" TEXT NOT NULL,
    "codigoBarras" TEXT,
    "unidadeMedida" "UnidadeMedida" NOT NULL DEFAULT 'UN',
    "precoCusto" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "precoVenda" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "margemLucro" DECIMAL(7,4) NOT NULL DEFAULT 0,
    "estoqueAtual" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "estoqueMinimo" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "ncm" TEXT,
    "cfop" TEXT,
    "cst" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes_estoque" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "produtoId" UUID NOT NULL,
    "fornecedorId" UUID,
    "tipo" "TipoMovimentacaoEstoque" NOT NULL,
    "quantidade" DECIMAL(14,3) NOT NULL,
    "custoUnitario" DECIMAL(14,2),
    "saldoApos" DECIMAL(14,3) NOT NULL,
    "origemTipo" TEXT,
    "origemId" UUID,
    "motivo" TEXT,
    "usuarioId" UUID NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "tipoPessoa" "TipoPessoa" NOT NULL DEFAULT 'FISICA',
    "nome" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "telefone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" VARCHAR(2),
    "cep" TEXT,
    "limiteCredito" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fornecedores" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "tipoPessoa" "TipoPessoa" NOT NULL DEFAULT 'JURIDICA',
    "nome" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" VARCHAR(2),
    "cep" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "fornecedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fornecedor_produtos" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "fornecedorId" UUID NOT NULL,
    "produtoId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fornecedor_produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orcamentos" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "filialId" UUID,
    "clienteId" UUID NOT NULL,
    "status" "StatusOrcamento" NOT NULL DEFAULT 'RASCUNHO',
    "descontoGeral" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "validade" TIMESTAMP(3),
    "observacoes" TEXT,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "orcamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orcamento_itens" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "orcamentoId" UUID NOT NULL,
    "produtoId" UUID NOT NULL,
    "quantidade" DECIMAL(14,3) NOT NULL,
    "precoUnitario" DECIMAL(14,2) NOT NULL,
    "desconto" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orcamento_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendas" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "filialId" UUID,
    "clienteId" UUID,
    "orcamentoId" UUID,
    "caixaSessaoId" UUID,
    "status" "StatusVenda" NOT NULL DEFAULT 'CONCLUIDA',
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "descontoGeral" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "custoTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "usuarioId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venda_itens" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "vendaId" UUID NOT NULL,
    "produtoId" UUID NOT NULL,
    "quantidade" DECIMAL(14,3) NOT NULL,
    "precoUnitario" DECIMAL(14,2) NOT NULL,
    "desconto" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "custoUnitario" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "venda_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venda_pagamentos" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "vendaId" UUID NOT NULL,
    "formaPagamento" "FormaPagamento" NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "parcelas" INTEGER,
    "bandeira" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "venda_pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contas_receber" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "vendaId" UUID,
    "clienteId" UUID,
    "descricao" TEXT NOT NULL,
    "valorTotal" DECIMAL(14,2) NOT NULL,
    "valorRecebido" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "status" "StatusConta" NOT NULL DEFAULT 'ABERTO',
    "parcelaNumero" INTEGER,
    "parcelaTotal" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "contas_receber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recebimentos_recebivel" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "contaReceberId" UUID NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formaPagamento" "FormaPagamento" NOT NULL,
    "usuarioId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recebimentos_recebivel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_despesa" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "categorias_despesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contas_pagar" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "fornecedorId" UUID,
    "categoriaDespesaId" UUID,
    "descricao" TEXT NOT NULL,
    "valorTotal" DECIMAL(14,2) NOT NULL,
    "valorPago" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "status" "StatusConta" NOT NULL DEFAULT 'ABERTO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "contas_pagar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos_pagavel" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "contaPagarId" UUID NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagamentos_pagavel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caixa_sessoes" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "filialId" UUID,
    "usuarioAberturaId" UUID NOT NULL,
    "valorAbertura" DECIMAL(14,2) NOT NULL,
    "valorFechamentoInformado" DECIMAL(14,2),
    "valorFechamentoEsperado" DECIMAL(14,2),
    "diferenca" DECIMAL(14,2),
    "status" "StatusCaixaSessao" NOT NULL DEFAULT 'ABERTO',
    "abertoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechadoEm" TIMESTAMP(3),

    CONSTRAINT "caixa_sessoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentos_caixa" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "caixaSessaoId" UUID NOT NULL,
    "tipo" "TipoMovimentoCaixa" NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "descricao" TEXT,
    "origemTipo" TEXT,
    "origemId" UUID,
    "usuarioId" UUID NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentos_caixa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_documento_key" ON "empresas"("documento");

-- CreateIndex
CREATE INDEX "filiais_empresaId_idx" ON "filiais"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_authUserId_key" ON "usuarios"("authUserId");

-- CreateIndex
CREATE INDEX "usuarios_empresaId_idx" ON "usuarios"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_empresaId_email_key" ON "usuarios"("empresaId", "email");

-- CreateIndex
CREATE INDEX "papeis_empresaId_idx" ON "papeis"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "papeis_empresaId_nome_key" ON "papeis"("empresaId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "permissoes_chave_key" ON "permissoes"("chave");

-- CreateIndex
CREATE INDEX "papel_permissoes_empresaId_idx" ON "papel_permissoes"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "papel_permissoes_papelId_permissaoId_key" ON "papel_permissoes"("papelId", "permissaoId");

-- CreateIndex
CREATE INDEX "usuario_papeis_empresaId_idx" ON "usuario_papeis"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_papeis_usuarioId_papelId_key" ON "usuario_papeis"("usuarioId", "papelId");

-- CreateIndex
CREATE INDEX "audit_logs_empresaId_idx" ON "audit_logs"("empresaId");

-- CreateIndex
CREATE INDEX "audit_logs_empresaId_entidade_entidadeId_idx" ON "audit_logs"("empresaId", "entidade", "entidadeId");

-- CreateIndex
CREATE INDEX "categorias_empresaId_idx" ON "categorias"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_empresaId_nome_key" ON "categorias"("empresaId", "nome");

-- CreateIndex
CREATE INDEX "produtos_empresaId_idx" ON "produtos"("empresaId");

-- CreateIndex
CREATE INDEX "produtos_empresaId_ativo_idx" ON "produtos"("empresaId", "ativo");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_empresaId_sku_key" ON "produtos"("empresaId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_empresaId_codigoBarras_key" ON "produtos"("empresaId", "codigoBarras");

-- CreateIndex
CREATE INDEX "movimentacoes_estoque_empresaId_idx" ON "movimentacoes_estoque"("empresaId");

-- CreateIndex
CREATE INDEX "movimentacoes_estoque_empresaId_produtoId_idx" ON "movimentacoes_estoque"("empresaId", "produtoId");

-- CreateIndex
CREATE INDEX "movimentacoes_estoque_empresaId_tipo_idx" ON "movimentacoes_estoque"("empresaId", "tipo");

-- CreateIndex
CREATE INDEX "clientes_empresaId_idx" ON "clientes"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_empresaId_documento_key" ON "clientes"("empresaId", "documento");

-- CreateIndex
CREATE INDEX "fornecedores_empresaId_idx" ON "fornecedores"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_empresaId_documento_key" ON "fornecedores"("empresaId", "documento");

-- CreateIndex
CREATE INDEX "fornecedor_produtos_empresaId_idx" ON "fornecedor_produtos"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedor_produtos_fornecedorId_produtoId_key" ON "fornecedor_produtos"("fornecedorId", "produtoId");

-- CreateIndex
CREATE INDEX "orcamentos_empresaId_idx" ON "orcamentos"("empresaId");

-- CreateIndex
CREATE INDEX "orcamentos_empresaId_status_idx" ON "orcamentos"("empresaId", "status");

-- CreateIndex
CREATE INDEX "orcamento_itens_empresaId_idx" ON "orcamento_itens"("empresaId");

-- CreateIndex
CREATE INDEX "orcamento_itens_orcamentoId_idx" ON "orcamento_itens"("orcamentoId");

-- CreateIndex
CREATE UNIQUE INDEX "vendas_orcamentoId_key" ON "vendas"("orcamentoId");

-- CreateIndex
CREATE INDEX "vendas_empresaId_idx" ON "vendas"("empresaId");

-- CreateIndex
CREATE INDEX "vendas_empresaId_status_idx" ON "vendas"("empresaId", "status");

-- CreateIndex
CREATE INDEX "venda_itens_empresaId_idx" ON "venda_itens"("empresaId");

-- CreateIndex
CREATE INDEX "venda_itens_vendaId_idx" ON "venda_itens"("vendaId");

-- CreateIndex
CREATE INDEX "venda_pagamentos_empresaId_idx" ON "venda_pagamentos"("empresaId");

-- CreateIndex
CREATE INDEX "venda_pagamentos_vendaId_idx" ON "venda_pagamentos"("vendaId");

-- CreateIndex
CREATE INDEX "contas_receber_empresaId_idx" ON "contas_receber"("empresaId");

-- CreateIndex
CREATE INDEX "contas_receber_empresaId_status_idx" ON "contas_receber"("empresaId", "status");

-- CreateIndex
CREATE INDEX "contas_receber_empresaId_vencimento_idx" ON "contas_receber"("empresaId", "vencimento");

-- CreateIndex
CREATE INDEX "recebimentos_recebivel_empresaId_idx" ON "recebimentos_recebivel"("empresaId");

-- CreateIndex
CREATE INDEX "recebimentos_recebivel_contaReceberId_idx" ON "recebimentos_recebivel"("contaReceberId");

-- CreateIndex
CREATE INDEX "categorias_despesa_empresaId_idx" ON "categorias_despesa"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_despesa_empresaId_nome_key" ON "categorias_despesa"("empresaId", "nome");

-- CreateIndex
CREATE INDEX "contas_pagar_empresaId_idx" ON "contas_pagar"("empresaId");

-- CreateIndex
CREATE INDEX "contas_pagar_empresaId_status_idx" ON "contas_pagar"("empresaId", "status");

-- CreateIndex
CREATE INDEX "contas_pagar_empresaId_vencimento_idx" ON "contas_pagar"("empresaId", "vencimento");

-- CreateIndex
CREATE INDEX "pagamentos_pagavel_empresaId_idx" ON "pagamentos_pagavel"("empresaId");

-- CreateIndex
CREATE INDEX "pagamentos_pagavel_contaPagarId_idx" ON "pagamentos_pagavel"("contaPagarId");

-- CreateIndex
CREATE INDEX "caixa_sessoes_empresaId_idx" ON "caixa_sessoes"("empresaId");

-- CreateIndex
CREATE INDEX "caixa_sessoes_empresaId_status_idx" ON "caixa_sessoes"("empresaId", "status");

-- CreateIndex
CREATE INDEX "movimentos_caixa_empresaId_idx" ON "movimentos_caixa"("empresaId");

-- CreateIndex
CREATE INDEX "movimentos_caixa_caixaSessaoId_idx" ON "movimentos_caixa"("caixaSessaoId");

-- CreateIndex (covering indexes for foreign keys)
CREATE INDEX "audit_logs_usuarioId_idx" ON "audit_logs"("usuarioId");
CREATE INDEX "caixa_sessoes_filialId_idx" ON "caixa_sessoes"("filialId");
CREATE INDEX "caixa_sessoes_usuarioAberturaId_idx" ON "caixa_sessoes"("usuarioAberturaId");
CREATE INDEX "contas_pagar_categoriaDespesaId_idx" ON "contas_pagar"("categoriaDespesaId");
CREATE INDEX "contas_pagar_fornecedorId_idx" ON "contas_pagar"("fornecedorId");
CREATE INDEX "contas_receber_clienteId_idx" ON "contas_receber"("clienteId");
CREATE INDEX "contas_receber_vendaId_idx" ON "contas_receber"("vendaId");
CREATE INDEX "fornecedor_produtos_produtoId_idx" ON "fornecedor_produtos"("produtoId");
CREATE INDEX "movimentacoes_estoque_fornecedorId_idx" ON "movimentacoes_estoque"("fornecedorId");
CREATE INDEX "movimentacoes_estoque_produtoId_idx" ON "movimentacoes_estoque"("produtoId");
CREATE INDEX "movimentacoes_estoque_usuarioId_idx" ON "movimentacoes_estoque"("usuarioId");
CREATE INDEX "movimentos_caixa_usuarioId_idx" ON "movimentos_caixa"("usuarioId");
CREATE INDEX "orcamento_itens_produtoId_idx" ON "orcamento_itens"("produtoId");
CREATE INDEX "orcamentos_clienteId_idx" ON "orcamentos"("clienteId");
CREATE INDEX "pagamentos_pagavel_usuarioId_idx" ON "pagamentos_pagavel"("usuarioId");
CREATE INDEX "papel_permissoes_permissaoId_idx" ON "papel_permissoes"("permissaoId");
CREATE INDEX "produtos_categoriaId_idx" ON "produtos"("categoriaId");
CREATE INDEX "recebimentos_recebivel_usuarioId_idx" ON "recebimentos_recebivel"("usuarioId");
CREATE INDEX "usuario_papeis_papelId_idx" ON "usuario_papeis"("papelId");
CREATE INDEX "usuarios_filialId_idx" ON "usuarios"("filialId");
CREATE INDEX "venda_itens_produtoId_idx" ON "venda_itens"("produtoId");
CREATE INDEX "vendas_caixaSessaoId_idx" ON "vendas"("caixaSessaoId");
CREATE INDEX "vendas_clienteId_idx" ON "vendas"("clienteId");
CREATE INDEX "vendas_usuarioId_idx" ON "vendas"("usuarioId");

-- AddForeignKey
ALTER TABLE "filiais" ADD CONSTRAINT "filiais_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "filiais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "papeis" ADD CONSTRAINT "papeis_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "papel_permissoes" ADD CONSTRAINT "papel_permissoes_papelId_fkey" FOREIGN KEY ("papelId") REFERENCES "papeis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "papel_permissoes" ADD CONSTRAINT "papel_permissoes_permissaoId_fkey" FOREIGN KEY ("permissaoId") REFERENCES "permissoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_papeis" ADD CONSTRAINT "usuario_papeis_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_papeis" ADD CONSTRAINT "usuario_papeis_papelId_fkey" FOREIGN KEY ("papelId") REFERENCES "papeis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedores" ADD CONSTRAINT "fornecedores_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedor_produtos" ADD CONSTRAINT "fornecedor_produtos_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedor_produtos" ADD CONSTRAINT "fornecedor_produtos_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedor_produtos" ADD CONSTRAINT "fornecedor_produtos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamento_itens" ADD CONSTRAINT "orcamento_itens_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamento_itens" ADD CONSTRAINT "orcamento_itens_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "orcamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamento_itens" ADD CONSTRAINT "orcamento_itens_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "orcamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_caixaSessaoId_fkey" FOREIGN KEY ("caixaSessaoId") REFERENCES "caixa_sessoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_itens" ADD CONSTRAINT "venda_itens_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_itens" ADD CONSTRAINT "venda_itens_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_itens" ADD CONSTRAINT "venda_itens_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_pagamentos" ADD CONSTRAINT "venda_pagamentos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_pagamentos" ADD CONSTRAINT "venda_pagamentos_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_receber" ADD CONSTRAINT "contas_receber_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_receber" ADD CONSTRAINT "contas_receber_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_receber" ADD CONSTRAINT "contas_receber_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recebimentos_recebivel" ADD CONSTRAINT "recebimentos_recebivel_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recebimentos_recebivel" ADD CONSTRAINT "recebimentos_recebivel_contaReceberId_fkey" FOREIGN KEY ("contaReceberId") REFERENCES "contas_receber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recebimentos_recebivel" ADD CONSTRAINT "recebimentos_recebivel_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias_despesa" ADD CONSTRAINT "categorias_despesa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_pagar" ADD CONSTRAINT "contas_pagar_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_pagar" ADD CONSTRAINT "contas_pagar_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_pagar" ADD CONSTRAINT "contas_pagar_categoriaDespesaId_fkey" FOREIGN KEY ("categoriaDespesaId") REFERENCES "categorias_despesa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos_pagavel" ADD CONSTRAINT "pagamentos_pagavel_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos_pagavel" ADD CONSTRAINT "pagamentos_pagavel_contaPagarId_fkey" FOREIGN KEY ("contaPagarId") REFERENCES "contas_pagar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos_pagavel" ADD CONSTRAINT "pagamentos_pagavel_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caixa_sessoes" ADD CONSTRAINT "caixa_sessoes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caixa_sessoes" ADD CONSTRAINT "caixa_sessoes_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "filiais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caixa_sessoes" ADD CONSTRAINT "caixa_sessoes_usuarioAberturaId_fkey" FOREIGN KEY ("usuarioAberturaId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentos_caixa" ADD CONSTRAINT "movimentos_caixa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentos_caixa" ADD CONSTRAINT "movimentos_caixa_caixaSessaoId_fkey" FOREIGN KEY ("caixaSessaoId") REFERENCES "caixa_sessoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentos_caixa" ADD CONSTRAINT "movimentos_caixa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
