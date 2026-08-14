#!/bin/bash
# Deploy Checklist - LUMEN ERP Produção (2026-08-13)
# Platforms: Vercel (frontend) + Render (backend) + Supabase (database)

set -e

echo "🚀 LUMEN ERP - DEPLOY PRODUCTION CHECKLIST"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_mark() {
  echo -e "${GREEN}✓${NC} $1"
}

warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

error() {
  echo -e "${RED}✗${NC} $1"
}

# ============================================================================
# SEÇÃO 0: SEGURANÇA (BLOQUEANTE)
# ============================================================================
echo ""
echo "SEÇÃO 0: PRÉ-REQUISITOS DE SEGURANÇA"
echo "===================================="
echo ""

echo "📋 Checklist de segurança:"
echo ""
echo "[ ] 1. Rotacionar senhas dos papéis Postgres no dev (Seção 0 do docs/deploy.md)"
echo "       - app_api com nova senha"
echo "       - prisma_migrator com nova senha"
echo "       - Atualizar DATABASE_URL e DIRECT_URL locais"
echo ""
echo "[ ] 2. Projeto Supabase NOVO criado para produção (separado do dev)"
echo ""
echo "[ ] 3. Repositório foi revirado para secrets hardcoded? (Não encontramos)"
echo ""
echo "[ ] 4. CORS_ORIGINS pronto para produção: lumenerp"
echo ""

read -p "Confirma que completou a SEÇÃO 0? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
  error "Deploy bloqueado. Resolva a SEÇÃO 0 primeiro."
  exit 1
fi

check_mark "Seção 0 confirmada"
echo ""

# ============================================================================
# SEÇÃO 1: BANCO DE DADOS (SUPABASE)
# ============================================================================
echo ""
echo "SEÇÃO 1: PROVISIONAR SUPABASE PRODUÇÃO"
echo "======================================"
echo ""

echo "[ ] 1. Acessar projeto Supabase produção (https://app.supabase.com)"
echo ""
echo "[ ] 2. SQL Editor → rode scripts/01-bootstrap-roles.sql"
echo "       Substitua os placeholders de senha TROQUE_POR_UMA_SENHA_FORTE_*"
echo ""
echo "[ ] 3. Confirme que app_api está com rolbypassrls = false"
echo "       SELECT rolname, rolbypassrls FROM pg_roles WHERE rolname IN ('app_api', 'prisma_migrator');"
echo ""

echo "[ ] 4. Copie as connection strings:"
echo "       - DATABASE_URL (papel app_api)"
echo "       - DIRECT_URL (papel prisma_migrator)"
echo "       - SUPABASE_SECRET_KEY"
echo ""

read -p "Você copiou os valores do Supabase? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
  error "Deploy bloqueado. Copie os valores do Supabase primeiro."
  exit 1
fi

check_mark "Supabase provisionado"
echo ""

# ============================================================================
# SEÇÃO 2: VARIÁVEIS DE AMBIENTE
# ============================================================================
echo ""
echo "SEÇÃO 2: PREPARAR VARIÁVEIS DE AMBIENTE"
echo "======================================="
echo ""

echo "Variáveis necessárias:"
echo ""
echo "BACKEND (Render environment variables):"
echo "  DATABASE_URL           = (copiar do Supabase)"
echo "  DIRECT_URL             = (copiar do Supabase)"
echo "  SUPABASE_URL           = https://xxxxx.supabase.co"
echo "  SUPABASE_JWKS_URL      = https://xxxxx.supabase.co/auth/v1/.well-known/jwks.json"
echo "  SUPABASE_PUBLISHABLE_KEY = (do Supabase)"
echo "  SUPABASE_SECRET_KEY    = (do Supabase) - CRIAR SECRET"
echo "  CORS_ORIGINS           = https://lumenerp.vercel.app"
echo "  NODE_ENV               = production"
echo "  PORT                   = 3001"
echo ""
echo "FRONTEND (Vercel environment variables):"
echo "  NEXT_PUBLIC_SUPABASE_URL              = https://xxxxx.supabase.co"
echo "  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = (do Supabase)"
echo "  NEXT_PUBLIC_API_URL                  = https://lumen-erp.onrender.com/api/v1"
echo ""

read -p "Você tem todas as variáveis prontas? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
  warning "Pause e colha os valores. Retorne quando estiver pronto."
  exit 0
fi

check_mark "Variáveis prontas"
echo ""

# ============================================================================
# SEÇÃO 3: BUILD LOCAL
# ============================================================================
echo ""
echo "SEÇÃO 3: BUILD LOCAL E VERIFICAÇÕES"
echo "===================================="
echo ""

echo "[ ] Limpando builds anteriores..."
pnpm --filter @erp/api clean
pnpm --filter @erp/web clean

echo "[ ] Build do backend..."
pnpm --filter @erp/api build

echo "[ ] Build do frontend..."
pnpm --filter @erp/web build

check_mark "Builds completados"
echo ""

# ============================================================================
# SEÇÃO 4: TESTES PRÉ-DEPLOY
# ============================================================================
echo ""
echo "SEÇÃO 4: TESTES E VALIDAÇÕES"
echo "============================="
echo ""

echo "[ ] Executando testes..."
pnpm --filter @erp/api test

check_mark "Testes passaram"
echo ""

# ============================================================================
# SEÇÃO 5: RENDER SETUP (Backend)
# ============================================================================
echo ""
echo "SEÇÃO 5: DEPLOY BACKEND (RENDER)"
echo "================================="
echo ""

echo "Manual steps no Render:"
echo ""
echo "[ ] 1. Criar novo Web Service no Render (https://dashboard.render.com)"
echo ""
echo "[ ] 2. Conectar repositório GitHub:"
echo "       - Repo: seu-repo"
echo "       - Branch: main"
echo "       - Root Directory: (deixar vazio)"
echo ""
echo "[ ] 3. Build Configuration:"
echo "       - Build Command: pnpm --filter @erp/api build"
echo "       - Start Command: pnpm --filter @erp/api start:prod"
echo ""
echo "[ ] 4. Environment Variables:"
echo "       - Adicionar todas as variáveis da SEÇÃO 2 (Backend)"
echo "       - IMPORTANTE: SUPABASE_SECRET_KEY como 'Secret'"
echo ""
echo "[ ] 5. Health Check:"
echo "       - Endpoint: /api/v1/health"
echo "       - Interval: 30s"
echo "       - Timeout: 5s"
echo "       - Threshold: 3"
echo ""
echo "[ ] 6. Deploy:"
echo "       - Clickar em 'Deploy'"
echo "       - Aguardar build (5-10 minutos)"
echo "       - Verificar logs"
echo ""

read -p "Você fez deploy no Render? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
  warning "Pause e faça o deploy no Render. Retorne quando terminar."
  exit 0
fi

check_mark "Backend deployado"
echo ""

# ============================================================================
# SEÇÃO 6: MIGRATIONS
# ============================================================================
echo ""
echo "SEÇÃO 6: EXECUTAR MIGRATIONS"
echo "============================"
echo ""

echo "⚠️  IMPORTANTE: Execute como comando one-off no Render"
echo ""
echo "Render Dashboard → Seu Service → Shell"
echo ""
echo "Cole este comando:"
echo ""
echo "pnpm --filter @erp/api exec prisma migrate deploy"
echo ""
echo "Depois:"
echo ""
echo "pnpm --filter @erp/api exec prisma db seed"
echo ""

read -p "Você rodou as migrations e seed? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
  warning "Pause e execute as migrations. Retorne quando terminar."
  exit 0
fi

check_mark "Migrations executadas"
echo ""

# ============================================================================
# SEÇÃO 7: FRONTEND SETUP (VERCEL)
# ============================================================================
echo ""
echo "SEÇÃO 7: DEPLOY FRONTEND (VERCEL)"
echo "=================================="
echo ""

echo "Manual steps no Vercel:"
echo ""
echo "[ ] 1. Criar novo projeto (https://vercel.com/new)"
echo ""
echo "[ ] 2. Conectar repositório e configurar:"
echo "       - Framework: Next.js"
echo "       - Root Directory: apps/web"
echo "       - Build Command: pnpm install && pnpm --filter @erp/web build"
echo "       - Install Command: pnpm install"
echo ""
echo "[ ] 3. Environment Variables:"
echo "       - NEXT_PUBLIC_SUPABASE_URL"
echo "       - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
echo "       - NEXT_PUBLIC_API_URL (apontar para Render backend)"
echo ""
echo "[ ] 4. Deploy"
echo ""

read -p "Você fez deploy no Vercel? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
  warning "Pause e faça o deploy no Vercel. Retorne quando terminar."
  exit 0
fi

check_mark "Frontend deployado"
echo ""

# ============================================================================
# SEÇÃO 8: PÓS-DEPLOY VERIFICATION
# ============================================================================
echo ""
echo "SEÇÃO 8: VERIFICAÇÕES PÓS-DEPLOY"
echo "================================="
echo ""

RENDER_API_URL="https://lumen-erp.onrender.com"
VERCEL_URL="https://lumenerp.vercel.app"

echo "Executando verificações..."
echo ""

# Test 1: Health check
echo -n "[ ] Health check ... "
if curl -s "${RENDER_API_URL}/api/v1/health" | grep -q "ok"; then
  check_mark "OK"
else
  error "FALHOU"
fi

# Test 2: Swagger should be 404
echo -n "[ ] Swagger desabilitado (404) ... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${RENDER_API_URL}/api/v1/docs")
if [ "$HTTP_CODE" = "404" ]; then
  check_mark "OK (404)"
else
  error "Retornou $HTTP_CODE (esperava 404)"
fi

# Test 3: Unauthenticated request
echo -n "[ ] Autenticação obrigatória (401) ... "
if curl -s "${RENDER_API_URL}/api/v1/me" | grep -q "Unauthorized\|Credenciais"; then
  check_mark "OK"
else
  error "FALHOU"
fi

# Test 4: CORS
echo -n "[ ] CORS configurado ... "
CORS_HEADER=$(curl -s -I -H "Origin: https://outraorigin.com" "${RENDER_API_URL}/api/v1/health" | grep -i "access-control-allow-origin" || true)
if [ -z "$CORS_HEADER" ]; then
  check_mark "OK (bloqueado)"
else
  error "Pode estar aberto demais"
fi

echo ""
echo "✅ DEPLOY CONCLUÍDO!"
echo ""
echo "Próximas verificações manuais:"
echo "  [ ] 1. Abrir ${VERCEL_URL} no navegador"
echo "  [ ] 2. Login com usuário admin"
echo "  [ ] 3. Testar navegação (Dashboard, PDV, Produtos, etc)"
echo "  [ ] 4. Criar produto e fazer venda"
echo "  [ ] 5. Gerar orçamento e baixar PDF"
echo "  [ ] 6. Testar isolamento entre empresas"
echo ""
echo "🎉 Sucesso!"
