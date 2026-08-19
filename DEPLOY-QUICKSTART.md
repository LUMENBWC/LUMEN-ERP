# 🚀 LUMEN ERP - Deploy em Produção

## ✅ Status de Pré-Deploy

```
✓ Backend builds com sucesso
✓ Frontend builds com sucesso (28 páginas)
✓ Todos os 253 testes passando
✓ Sem secrets hardcoded
✓ Rate limiting implementado
✓ Security headers configurados
✓ Documentação completa
```

---

## 📋 Deployment Checklist Rápido

### PASSO 1: Supabase Produção (5-10 min)

- [ ] Criar novo projeto em https://app.supabase.com
- [ ] SQL Editor → rodar `scripts/01-bootstrap-roles.sql`
- [ ] Copiar `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_SECRET_KEY`
- [ ] Copiar `SUPABASE_URL`, `SUPABASE_JWKS_URL`, `SUPABASE_PUBLISHABLE_KEY`

### PASSO 2: Backend (Render) - 15 min

- [ ] https://dashboard.render.com → New Web Service
- [ ] Conectar GitHub repo
- [ ] Configurar Dockerfile: `docker/Dockerfile.api`
- [ ] Adicionar Environment Variables (8 variáveis)
- [ ] Health Check: `/api/v1/health`
- [ ] Deploy
- [ ] **Após deploy**: Shell → executar migrations + seed

### PASSO 3: Frontend (Vercel) - 10 min

- [ ] https://vercel.com/new
- [ ] Conectar GitHub repo
- [ ] Root Directory: `apps/web`
- [ ] Adicionar 3 variáveis NEXT_PUBLIC_*
- [ ] Deploy (automático)

### PASSO 4: Verificação

- [ ] `curl https://lumen-erp-lix1.onrender.com/api/v1/health` → OK
- [ ] Abrir `https://lumenerp.vercel.app`
- [ ] Login funciona
- [ ] Criar produto → venda → orçamento

---

## 📁 Documentação

| Arquivo                                                      | Descrição                                               |
| ------------------------------------------------------------ | ------------------------------------------------------- |
| [docs/DEPLOY-RENDER-VERCEL.md](docs/DEPLOY-RENDER-VERCEL.md) | **👈 COMECE AQUI** - Guia passo-a-passo Render + Vercel |
| [.env.production.template](.env.production.template)         | Template com todas as variáveis necessárias             |
| [docs/deploy.md](docs/deploy.md)                             | Referência completa (Coolify, mas aplicável)            |
| [docs/SECURITY.md](docs/SECURITY.md)                         | Segurança implementada                                  |

---

## 🔑 Variáveis Essenciais

### Backend (Render)

```env
DATABASE_URL=postgresql://app_api.xxx:[SENHA]@xxx.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://prisma_migrator.xxx:[SENHA]@xxx.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_JWKS_URL=https://xxx.supabase.co/auth/v1/.well-known/jwks.json
SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SECRET_KEY=eyJ... (MARCAR COMO SECRET)
CORS_ORIGINS=https://lumenerp.vercel.app
NODE_ENV=production
```

### Frontend (Vercel)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
NEXT_PUBLIC_API_URL=https://lumen-erp-lix1.onrender.com/api/v1
```

---

## ⚠️ Cuidados

| ⚠️                      | Descrição                                                 |
| ----------------------- | --------------------------------------------------------- |
| **CORS_ORIGINS**        | Obrigatório em produção. API NÃO sobe sem.                |
| **SUPABASE_SECRET_KEY** | Marcar como "Secret" no Render (não em plain text)        |
| **Migrations**          | Rodam como comando Shell após deploy, não automaticamente |
| **Swagger**             | Desligado em produção (NODE_ENV=production)               |
| **Database**            | Projeto Supabase **separado** do desenvolvimento          |

---

## 🌍 URLs Finais

| Serviço        | URL                                          |
| -------------- | -------------------------------------------- |
| **Frontend**   | https://lumenerp.vercel.app                  |
| **Backend**    | https://lumen-erp-lix1.onrender.com               |
| **API Health** | https://lumen-erp-lix1.onrender.com/api/v1/health |

---

## 🔒 Segurança

Implementado:

- ✅ Rate limiting (global + auth endpoints)
- ✅ CORS com whitelist obrigatória
- ✅ Security headers (CSP, HSTS, X-Frame-Options)
- ✅ Input validation (whitelist + forbid unknown fields)
- ✅ JWT verification sem secrets expostos
- ✅ RLS (Row Level Security) no banco
- ✅ Sem console.log de dados sensíveis

Ver: [docs/SECURITY.md](docs/SECURITY.md)

---

## 📞 Troubleshooting

**"CORS_ORIGINS é obrigatória em produção"**

- Adicionar em Environment Variables do Render
- Valor: `https://lumenerp.vercel.app`

**"max clients reached in session mode"**

- Verificar `DB_POOL_MAX` (default 8)
- Supabase free tier tem ~15 conexões total

**"Cannot GET /api/v1/health"**

- Render ainda está fazendo build (5-10 min)
- Verificar logs no painel

**"Frontend vê ERR_CONNECTION_REFUSED"**

- API está fora do ar
- Verificar `NEXT_PUBLIC_API_URL`
- Testar: `curl https://lumen-erp-lix1.onrender.com/api/v1/health`

---

## 📞 Próximos Passos Após Deploy

1. **Configurar domínio customizado**
   - Render: Settings → Custom Domain
   - Vercel: Project Settings → Domains

2. **Setup observability**
   - Logs centralizados
   - Alertas para taxa de erro

3. **Backup automático do Supabase**
   - Integração no project settings

4. **Monitoramento**
   - Uptime checks
   - Performance monitoring

---

**Status**: ✅ Pronto para deploy  
**Última atualização**: 2026-08-13  
**Mantido por**: LUMEN ERP Team
