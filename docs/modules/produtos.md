# Produtos & Categorias (Etapa 4)

## O que existe

**Backend (`apps/api/src/modules/produtos` e `.../categorias`)**

Mesmo padrão de camadas estabelecido na Etapa 3 (domain/application/infra/presentation), incluindo a mesma abstração de testabilidade (`TenantTransactionRunner` + repository factory injetável — use-cases não tocam Postgres em teste).

- **`modules/categorias`**: CRUD + ativar/desativar. Regra de domínio (`domain/garantir-hierarquia-valida.ts`, spec Secao 3.1 — "hierarquia simples de 1 nível"): uma categoria só pode ter `categoriaPaiId` apontando para uma categoria **raiz** (sem pai próprio), e uma categoria que já tem subcategorias não pode virar filha de outra.
- **`modules/produtos`**: CRUD + ativar/desativar + `GET /produtos/alertas/estoque-minimo`.
  - **Margem de lucro** (`domain/calcular-margem-lucro.ts`): sempre derivada de `precoCusto`/`precoVenda` ((venda − custo) / venda), nunca aceita do cliente — recalculada automaticamente em `POST /produtos` e sempre que `PATCH /produtos/:id` muda custo ou venda (spec Secao 3.1). Usa `Prisma.Decimal` (não `number`/`float`), mesma regra travada da spec para dinheiro.
  - **`estoqueAtual` é somente leitura** neste módulo — sempre `0` na criação, nunca aparece nos DTOs de atualização. Só muda via movimentações de estoque (Etapa 5); tentar editá-lo aqui seria a "solução temporária" que a spec proíbe.
  - **Alerta de estoque mínimo**: `estoqueMinimo > 0 AND estoqueAtual < estoqueMinimo`, calculado em memória (poucos milhares de produtos por empresa no MVP, `Prisma.Decimal.lessThan`/`.greaterThan` não são expressáveis num único filtro Prisma sem SQL bruto).
  - Únicos por empresa: `sku` (sempre) e `codigoBarras` (só quando informado — `@@unique` composto tolera múltiplos `NULL`).
- **Permissões**: `produtos.ler` (leitura) / `produtos.gerenciar` (escrita) — já existiam no catálogo da Etapa 1, cobrem os dois módulos.
- **Auditoria**: toda mutação grava `AuditLog`, reaproveitando o `AuditLogService` da Etapa 3.

**Frontend (`apps/web/src/features/categorias` e `.../produtos`)**

- `/categorias`: lista + criar/editar via `Dialog` (shadcn) — módulo pequeno o bastante pra não precisar de páginas dedicadas.
- `/produtos`, `/produtos/novo`, `/produtos/:id`: mesmo padrão de páginas da Etapa 3. Filtro "abaixo do estoque mínimo" na listagem; formulário deixa claro que margem e estoque atual não são editáveis.
- `features/produtos/store/produtos-filtros.store.ts`: Zustand, mesmo padrão de `usuarios-filtros.store.ts`.
- Nav do dashboard mostra "Produtos"/"Categorias" só para quem tem `produtos.ler`.

## Decisões / limitações conhecidas

- **Migration `categoriaPaiId`** aplicada via MCP da Supabase, não `prisma migrate deploy` — `categorias` é dona do role `postgres` (criada na migration `init`, antes do `prisma_migrator` existir), mesma situação documentada na [ADR-0004](../decisions/ADR-0004-etapa3-usuarios-decisoes.md) para `usuarios`/`papeis`.
- **Sem histórico de movimentações de estoque** ainda — a spec (Secao 3.1) pede "histórico de movimentações por produto", mas a tabela `MovimentacaoEstoque` só passa a ser escrita na Etapa 5. Não há endpoint stub para isso (a spec proíbe soluções temporárias/mockadas); ele aparece quando a Etapa 5 for implementada.
- **`filialId` de `Produto`** não aparece na UI, mesmo racional já registrado para `Usuario` na Etapa 3 (UI de filial vem depois).
- **Alerta de estoque mínimo é sempre "todos os produtos abaixo do mínimo"**, sem paginação — aceitável no MVP (poucos produtos por empresa); revisitar se a base de produtos crescer muito antes da Etapa 12 (Dashboard).

## Achado incidental: `app.enableShutdownHooks()` faltando

Durante o desenvolvimento desta etapa, um erro intermitente idêntico ao bug do Supavisor da Etapa 2 ([ADR-0003](../decisions/ADR-0003-supavisor-guc-bootstrap-pool.md)) apareceu de novo no log do servidor de dev. Investigado e descartado como regressão: um teste de carga com 120 requisições concorrentes simulando o padrão real do frontend (`/me` + `/usuarios` + `/papeis` disparando juntos) rodou 100% limpo, confirmando que a separação de pools da ADR-0003 continua correta.

A causa mais provável: `main.ts` nunca chamava `app.enableShutdownHooks()`, então `onModuleDestroy()` (que fecha `pgPool`/`authBootstrapPool`) nunca rodava nos restarts do `nest start --watch` a cada arquivo salvo — comum durante uma etapa inteira de desenvolvimento ativo. Conexões antigas ficavam penduradas no Supavisor em vez de fechadas de forma limpa. Corrigido (`main.ts`); é um artefato só de dev, não afeta produção (o processo não reinicia a cada poucos segundos lá), mas a correção é hygiene válida de qualquer forma.
