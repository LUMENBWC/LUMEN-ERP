# 🔒 Guia de Segurança - LUMEN ERP

Data: 2026-08-13  
Status: ✅ Implementado

## Resumo das Implementações

### 1. Rate Limiting ✅

- **Global**: 100 requisições / 15 minutos
- **Auth**: 5 requisições / 15 minutos (endpoints sensíveis)
- **Criação de recursos**: 50 requisições / 1 hora
- **Implementação**: `@nestjs/throttler` + decoradores customizados

### 2. Security Headers ✅

Helmet configurado com:

- **CSP** (Content Security Policy): Protege contra XSS
- **HSTS** (HTTP Strict Transport Security): 1 ano com preload
- **X-Frame-Options**: deny (protege contra clickjacking)
- **X-Content-Type-Options**: nosniff (protege contra MIME sniffing)
- **Referrer-Policy**: strict-origin-when-cross-origin
- **CORS**: Validação de origem obrigatória em produção

### 3. Proteção de Secrets ✅

- ✅ **DATABASE_URL**: Nunca hardcoded (via .env)
- ✅ **SUPABASE_SECRET_KEY**: Comentários de segurança no .env.example
- ✅ **.gitignore**: Protege `.env`, `.env.local` e variantes
- ✅ **Chaves de API**: Não encontradas hardcoded no código
- ✅ **Comentários visuais**: ⚠️ em variáveis críticas

### 4. Input Validation ✅

- ValidationPipe global com:
  - `whitelist: true` (rejeita campos não declarados)
  - `forbidNonWhitelisted: true` (erro ao encontrar campos extras)
  - `transform: true` (converte tipos automaticamente)
- Zod para validações complexas (vendas, orçamentos)
- class-validator para DTOs

### 5. Autenticação & Autorização ✅

- **JWT Verification**: Via `@supabase/server/core` usando JWKS público
- **RLS (Row Level Security)**: Política Postgres aplicada em runtime
- **AppRole app_api**: SEM BYPASSRLS (defesa em profundidade)
- **Tenant Context**: Resolvido por usuário, isolamento multi-tenant garantido

### 6. Logging & Auditoria ✅

- Sem `console.log()` de dados sensíveis visível
- Módulo AuditModule para rastrear ações críticas
- JWT nunca é logado

### 7. Request Size Limits ✅

- Máximo 10MB por requisição POST/PATCH
- Protege contra ataques de negação de serviço (DoS)

### 8. CORS ✅

- Em dev: reflete origem (flexível)
- Em produção: `CORS_ORIGINS` é **obrigatório**
- A API falha ao subir se `NODE_ENV=production` e `CORS_ORIGINS` vazio
- Previne requisições cross-origin maliciosas

## Pontos Adicionais

### Database Security

- Papel `app_api`: Não tem BYPASSRLS
- Papel `prisma_migrator`: Apenas para migrations, com permissões limitadas
- Prepared statements via Prisma (protege contra SQL injection)
- Pooler Supavisor em modo SESSION (garante isolation entre conexões)

### Frontend Security

- Next.js middleware ativo (segurança de rota)
- Variáveis públicas prefixadas com `NEXT_PUBLIC_`
- Secrets nunca expostos ao cliente

### Logging Seguro

- Endpoints públicos: `/api/v1/health` (sem auth, para health checks)
- Swagger desativado em produção (não exponha mapa de rotas)

## Próximos Passos Recomendados

1. **Em Produção**:
   - [ ] Definir `CORS_ORIGINS` com domínio exato (ex: `https://app.lumen.com.br`)
   - [ ] Usar secret manager (AWS Secrets Manager, Doppler, HashiCorp Vault)
   - [ ] Revisar logs e implementar alertas para rate limit violations
   - [ ] HTTPS obrigatório com certificado válido
   - [ ] Backup regular com senha forte

2. **Monitoramento**:
   - [ ] Implementar logging centralizado (ELK, Datadog, etc)
   - [ ] Alertas para múltiplas tentativas de autenticação falhadas
   - [ ] Monitoramento de anomalias em taxa de requisições

3. **Períodico**:
   - [ ] Auditar dependencies (usar `pnpm audit`)
   - [ ] Revisar CORS_ORIGINS regularmente
   - [ ] Testar rate limiting em ambiente de staging

## Variáveis Críticas

| Variável              | Tipo   | Risco | Ação                              |
| --------------------- | ------ | ----- | --------------------------------- |
| `DATABASE_URL`        | Secret | Alto  | Nunca commite, use .env.local     |
| `DIRECT_URL`          | Secret | Alto  | Nunca commite, use .env.local     |
| `SUPABASE_SECRET_KEY` | Secret | Alto  | Nunca commite, use secret manager |
| `CORS_ORIGINS`        | Config | Médio | Obrigatório em produção           |
| `SUPABASE_JWKS_URL`   | Public | Baixo | Pode ser público                  |

## Como Usar Rate Limiting nos Endpoints

```typescript
import { AuthThrottle } from 'src/common/rate-limit/throttle.decorator';

@Controller('usuarios')
export class UsuariosController {
  @Post()
  @AuthThrottle() // 5 req/15min
  create(@Body() dto: CreateUsuarioDto) {
    // ...
  }
}
```

## Testes de Segurança

Execute:

```bash
# Auditar dependências
pnpm audit

# Verificar TypeScript
pnpm typecheck

# Executar testes
pnpm test

# Testes E2E (inclui autenticação real)
pnpm test:e2e
```

---

**Última atualização**: 2026-08-13  
**Próxima revisão recomendada**: 2026-09-13 (mensal)
