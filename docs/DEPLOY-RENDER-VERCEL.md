# Deploy com Render + Vercel - Configuração Específica

## 🔧 Backend (Render)

### Render Web Service Setup

1. **Criar novo Web Service**
   - Name: `lumen-erp-api`
   - GitHub repo: seu-repo
   - Branch: `main`
   - Root Directory: deixar vazio
   - Environment: Docker
   - Plan: Starter ou Standard (conforme carga)

2. **Build & Deploy**
   - Auto-deploy: marcar `master/main` do GitHub
   - Build Command: (deixar vazio - vai usar Dockerfile)
   - Start Command: (deixar vazio - vai usar Dockerfile)
   - Dockerfile path: `docker/Dockerfile.api`
   - Docker context: `.`

3. **Environment Variables** (no painel do Render)

   ```
   DATABASE_URL=postgresql://app_api.xxxxx:[SENHA_FORTE]@xxxxx.pooler.supabase.com:5432/postgres
   DIRECT_URL=postgresql://prisma_migrator.xxxxx:[OUTRA_SENHA]@xxxxx.pooler.supabase.com:5432/postgres
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_JWKS_URL=https://xxxxx.supabase.co/auth/v1/.well-known/jwks.json
   SUPABASE_PUBLISHABLE_KEY=xxxxx
   SUPABASE_SECRET_KEY=xxxxx  (MARCAR COMO SECRET)
   CORS_ORIGINS=https://lumenerp.vercel.app
   NODE_ENV=production
   PORT=3001
   ```

4. **Health Check** (Settings → Health Check)

   ```
   HTTP GET /api/v1/health
   Interval: 30s
   Timeout: 5s
   Start period: 40s
   Retries: 3
   ```

5. **Deploy**
   - Clicar em "Deploy"
   - Aguardar 5-10 minutos
   - Verificar Logs

6. **Após deploy bem-sucedido, execute migrations**

   No Render Dashboard:
   - Seu Web Service → Shell
   - Cole: `pnpm --filter @erp/api exec prisma migrate deploy`
   - Cole: `pnpm --filter @erp/api exec prisma db seed`

---

## 🌐 Frontend (Vercel)

### Vercel Project Setup

1. **Criar novo projeto**
   - Import GitHub repo
   - Configurar:

   | Campo            | Valor                                          |
   | ---------------- | ---------------------------------------------- |
   | Framework Preset | Next.js                                        |
   | Root Directory   | `apps/web`                                     |
   | Build Command    | `pnpm install && pnpm --filter @erp/web build` |
   | Output Directory | `.next`                                        |
   | Install Command  | `pnpm install`                                 |

2. **Environment Variables**

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=xxxxx
   NEXT_PUBLIC_API_URL=https://lumen-erp.onrender.com/api/v1
   ```

3. **Deploy**
   - Vercel vai fazer auto-deploy ao fazer push para main
   - Verificar logs do build
   - Domínio padrão: `lumenerp.vercel.app`

---

## 📊 Checklist Pós-Deploy

```
Backend (Render):
[ ] Acessar https://lumen-erp.onrender.com/api/v1/health → {"status":"ok"}
[ ] GET /api/v1/docs → 404 (Swagger desligado)
[ ] GET /api/v1/me sem token → 401
[ ] Migrations executadas sem erro
[ ] Logs não mostram ERROR ou WARN críticos

Frontend (Vercel):
[ ] Acessar https://lumenerp.vercel.app → Página de login
[ ] Login com admin → Redirecionado para dashboard
[ ] Navegação funciona (PDV, Produtos, Vendas, etc)
[ ] Imagens e estilos carregam sem erro

Integração:
[ ] Dashboard faz requisições para API
[ ] Criar produto funciona
[ ] Fazer venda funciona
[ ] Gerar orçamento funciona
[ ] Download PDF do orçamento funciona
[ ] Isolamento entre empresas funciona (testar com 2 usuários)
```

---

## 🚨 Troubleshooting

### "CORS_ORIGINS é obrigatória em produção"

- Backend não subiu
- Verificar Environment Variables no Render
- Confirmar: `CORS_ORIGINS=https://lumenerp.vercel.app`

### "max clients reached in session mode"

- Muitas conexões simultâneas
- Verificar `DB_POOL_MAX` (default 8)
- Reduzir ou atualizar plano Supabase

### "Cannot GET /api/v1/health"

- Render ainda está fazendo build
- Verificar Logs no painel do Render
- Aguardar 5-10 minutos

### "Swagger aberto em produção"

- ENABLE_SWAGGER está true
- Remover ou deixar como false
- NODE_ENV tem que ser `production`

### Frontend vê "ERR_CONNECTION_REFUSED"

- API está fora do ar
- Verificar URL em NEXT_PUBLIC_API_URL
- Confirmar que Render API está rodando
- Testar curl direto: `curl https://lumen-erp.onrender.com/api/v1/health`

---

## 📝 URLs Finais

| Serviço      | URL                                                      |
| ------------ | -------------------------------------------------------- |
| Frontend     | https://lumenerp.vercel.app                              |
| Backend      | https://lumen-erp.onrender.com                           |
| API Docs     | https://lumen-erp.onrender.com/api/v1/docs (404 em prod) |
| Health Check | https://lumen-erp.onrender.com/api/v1/health             |
| Supabase     | https://app.supabase.com                                 |

---

## 🔐 Segurança em Produção

- ✅ DATABASE_URL marcada como Secret no Render
- ✅ SUPABASE_SECRET_KEY marcada como Secret no Render
- ✅ CORS_ORIGINS definida com domínio específico
- ✅ NODE_ENV=production (Swagger desligado)
- ✅ HTTPS enforced (Vercel + Render)
- ✅ Rate limiting ativo
- ✅ RLS policies no Supabase ativas

---

**Data**: 2026-08-13  
**Ambiente**: Produção (Render + Vercel + Supabase)  
**Status**: Ready to deploy
