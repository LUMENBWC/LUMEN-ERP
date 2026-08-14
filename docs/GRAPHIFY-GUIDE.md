# 🧠 Graphify - Knowledge Graph do LUMEN ERP

## ✅ Status da Instalação

```
✓ Graphify instalado e rodando
✓ 570 arquivos de código indexados
✓ 3.014 nodes + 8.474 edges criados
✓ 130 comunidades detectadas
✓ Grafo interativo em HTML
✓ Relatório completo em GRAPH_REPORT.md
```

## 📍 Arquivos Gerados

| Arquivo                        | Tamanho | Descrição                            |
| ------------------------------ | ------- | ------------------------------------ |
| `graphify-out/graph.html`      | 3.8MB   | **Visualização interativa** do grafo |
| `graphify-out/GRAPH_REPORT.md` | 31KB    | Relatório com todas as comunidades   |
| `graphify-out/graph.json`      | 5.0MB   | Dados brutos do grafo (JSON)         |
| `graphify-out/manifest.json`   | 120KB   | Manifesto do projeto                 |

---

## 🎯 Como Usar

### 1️⃣ Visualizar o Grafo Interativo

```bash
# Abrir em VS Code
open graphify-out/graph.html

# Ou no navegador
cd /Users/erick/Documents/LUMEN/LUMEN-ERP
open graphify-out/graph.html
```

✨ Você pode:

- Arrastar nodes
- Fazer zoom/pan
- Clicar em comunidades
- Filtrar por tipo (arquivo, classe, função, etc)
- Ver conexões entre módulos

### 2️⃣ Fazer Queries (Perguntas) sobre o Código

```bash
# Perguntar como algo funciona
graphify query "Como a autenticação funciona?"
graphify query "Como o isolamento multi-tenant é implementado?"
graphify query "Qual é o fluxo de uma venda?"

# Encontrar caminhos entre conceitos
graphify path "TenantContext" "Database"
graphify path "SupabaseAuthGuard" "RLS"

# Explicar um conceito específico
graphify explain "TenantTransactionRunner"
graphify explain "resolve-tenant-context"
```

### 3️⃣ Atualizar o Grafo após Mudanças

```bash
# Após fazer mudanças no código
graphify update /Users/erick/Documents/LUMEN/LUMEN-ERP
```

---

## 🎓 God Nodes (Abstrações Principais)

Estas são as abstrações mais conectadas do projeto:

| Node                          | Conexões | Descrição                              |
| ----------------------------- | -------- | -------------------------------------- |
| **TenantContext**             | 233      | Contexto de tenant (multi-tenant core) |
| **TenantTransactionRunner**   | 149      | Runner de transações por tenant        |
| **AuditLogService**           | 88       | Serviço de auditoria global            |
| **CurrentTenant**             | 82       | Decorator/middleware de tenant         |
| **RequirePermissions()**      | 81       | Decorator de validação de permissões   |
| **TENANT_TRANSACTION_RUNNER** | 69       | Token de injeção do runner             |
| **cn()**                      | 63       | Utilidade de classe CSS (classnames)   |
| **temPermissao()**            | 62       | Função de verificação de permissão     |

---

## 📊 Comunidades Principais

### Backend (APIs + Logic)

1. **resolve-tenant-context.ts** - Resolução de contexto de tenant
2. **AuditLogService** - Auditoria global
3. **dashboard.controller.ts** - Dashboard API
4. **caixa.controller.ts** - Caixa/PDV API
5. **categorias.controller.ts** - Categorias API
6. **vendas.controller.ts** - Vendas API
7. **financeiro.queries.ts** - Queries financeiro

### Frontend (UI Components)

1. **produtos-list.tsx** - Listagem de produtos
2. **button.tsx** - Componente Button
3. **caixa-page.tsx** - Página do Caixa/PDV
4. **cliente-detail.tsx** - Detalhe de cliente
5. **app-shell.tsx** - Shell principal da app
6. **finalizar-venda-dialog.tsx** - Dialog de venda

### Database (Persistence)

1. **prisma-orcamentos.repository.ts** - Repository orçamentos
2. **prisma-vendas.repository.ts** - Repository vendas
3. **prisma-financeiro.repository.ts** - Repository financeiro

---

## 🔍 Exemplos de Queries Úteis

### Entender a Arquitetura

```bash
# Fluxo multi-tenant
graphify query "Como o isolamento multi-tenant é garantido?"

# Arquitetura de autenticação
graphify query "Como a autenticação JWT funciona?"

# RLS no banco
graphify query "Como o Row Level Security é implementado?"
```

### Localizar Código Específico

```bash
# Encontrar validações
graphify query "Como as entradas do usuário são validadas?"

# Erro handling
graphify query "Como os erros são tratados?"

# Rate limiting
graphify query "Como o rate limiting funciona?"
```

### Análise de Fluxos

```bash
# Fluxo de venda
graphify query "Trace o caminho de uma venda do início ao fim"

# Geração de PDF
graphify query "Como os PDFs de orçamento são gerados?"

# Movimentação de estoque
graphify query "Como a entrada de estoque afeta o custo médio?"
```

### Encontrar Relacionamentos

```bash
# Entre módulos
graphify path "UsuariosModule" "VendasModule"

# Entre serviços
graphify path "AuditLogService" "PrismaService"

# Entre decorators
graphify path "RequirePermissions" "CurrentTenant"
```

---

## 📈 Estatísticas do Projeto

```
Estatística              Valor
────────────────────────────────
Nodes                    3.014
Edges                    8.474
Comunidades              130
Arquivos de código       570
Documentação             320
Imagens                  5
Ciclos de importação     0 (✓ Sem ciclos!)
Coesão média             0.09
```

---

## 🎯 Casos de Uso

### Para Onboarding

- "Mostre-me como o projeto é estruturado"
- "Qual é o fluxo principal de autenticação?"
- "Como os dados fluem pela aplicação?"

### Para Debugging

- "Onde é que CustomerX é usado?"
- "Quem chama ModuleY?"
- "Qual é o caminho de X até Database?"

### Para Refatoração

- "Qual é o impacto de mover ComponentA?"
- "Quem depende de ClassB?"
- "Há ciclos de dependência em ModuleC?"

### Para Documentação

- "Gere um diagrama de como TenantContext funciona"
- "Quais são as 5 abstrações mais críticas?"
- "Qual é o ponto de entrada principal?"

---

## ⚡ Comandos Rápidos

```bash
# Abrir grafo interativo
open graphify-out/graph.html

# Ver relatório
cat graphify-out/GRAPH_REPORT.md

# Fazer query com DFS (trace específico)
graphify query "Fluxo de venda" --dfs

# Limitar resposta a 1500 tokens
graphify query "Como funciona?" --budget 1500

# Atualizar após mudanças
graphify update .

# Ver commits mais recentes
git rev-parse HEAD
```

---

## 💡 Dicas

1. **Comece pela visualização HTML** - entenda a estrutura gráfica primeiro
2. **Use queries naturais** - "Como X funciona?" funciona melhor que "X"
3. **Combine com path** - use `path` para entender relacionamentos específicos
4. **Atualize após grandes mudanças** - `graphify update .` é rápido e gratuito
5. **Use --dfs para traces** - melhor que BFS quando você quer um caminho específico

---

## 🚀 Próximos Passos

### Para Riqueza Semântica (requer API key)

```bash
# Com Google Gemini
export GOOGLE_API_KEY="sua-chave"
graphify . --mode deep  # Re-executa com semantic extraction

# Com OpenAI
export OPENAI_API_KEY="sua-chave"
graphify . --mode deep
```

### Para Integração com Obsidian

```bash
# Criar um vault para Obsidian
graphify . --obsidian --obsidian-dir ~/Documents/LUMEN-ERP-Knowledge

# Isso cria uma pasta com:
# - index.md (mapa do projeto)
# - Arquivo por comunidade (linkável)
```

### Para Neo4j

```bash
# Gerar queries Cypher
graphify . --neo4j

# Ou fazer push direto
graphify . --neo4j-push bolt://localhost:7687
```

---

## 📚 Documentação Oficial

- [graphify GitHub](https://github.com/gtfierro/graphify)
- [Query Language](https://github.com/gtfierro/graphify#query-language)
- [Community Detection](https://github.com/gtfierro/graphify#communities)

---

## 🎉 Seu Projeto Está Pronto!

Agora você tem:

- ✅ Visualização interativa do código
- ✅ Análise automática de comunidades
- ✅ Query engine para fazer perguntas
- ✅ Documentação gerada automaticamente
- ✅ Detector de ciclos de dependência

**Comece abrindo**: `graphify-out/graph.html`

Bom explorar! 🚀
