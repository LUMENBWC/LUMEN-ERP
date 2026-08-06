# Estoque — Movimentações (Etapa 5)

## O que existe

**Backend (`apps/api/src/modules/estoque`)**

Mesmo padrão de camadas das etapas anteriores (domain/application/infra/presentation, `TenantTransactionRunner` + repository factory injetável).

- **`POST /estoque/entradas`**: registra `ENTRADA_COMPRA`. Recalcula `produto.precoCusto` como **custo médio ponderado** (`domain/calcular-custo-medio-ponderado.ts`) entre o estoque existente e a entrada, e `produto.margemLucro` (reaproveita `calcularMargemLucro` do módulo `produtos` — mesma regra, não duplicada).
- **`POST /estoque/ajustes`**: registra `AJUSTE_MANUAL`. Quantidade assinada (positiva aumenta, negativa reduz); motivo obrigatório.
- **`POST /estoque/perdas`**: registra `PERDA`. Quantidade sempre positiva no DTO (o quanto se perdeu); internamente vira um delta negativo. Motivo obrigatório.
- **`GET /estoque/movimentacoes`**: histórico paginado, filtro por produto/tipo/período. Também usado embutido no detalhe do produto (`ProdutoHistoricoEstoque`, spec Secao 3.1 — "histórico de movimentações por produto").
- **Concorrência**: toda escrita começa lendo o produto com `SELECT ... FOR UPDATE` (`obterProdutoComLock`, único uso de SQL bruto do módulo — a Prisma Client Extension de tenant-scoping só intercepta chamadas de model, então o filtro por `empresaId` aqui é manual, com a RLS cobrindo em profundidade). O lock é mantido pelo resto da transação; custo médio ponderado e saldo resultante são sempre calculados em cima do valor mais recente, nunca de uma leitura que outra transação concorrente já sobrescreveu.
- **Regra crítica** (spec Secao 3.2): ajuste manual e perda que deixariam o estoque negativo são bloqueados por padrão (`domain/calcular-saldo-apos-delta.ts`, lança `EstoqueInsuficienteError`) — só passam com a permissão `estoque.ajustarNegativo`, nova no catálogo (não existia antes desta etapa; ver decisão abaixo).
- **`MovimentacaoEstoque` é imutável** — sem endpoint de edição/exclusão, só criação e leitura, como a spec exige.
- **Auditoria**: toda mutação grava `AuditLog`, `entidade: 'MovimentacaoEstoque'`.

**Frontend (`apps/web/src/features/estoque`)**

- `/estoque`: histórico geral da empresa, filtro por produto/tipo, paginado. Três diálogos separados (`EntradaDialog`, `AjusteDialog`, `PerdaDialog`) em vez de um único formulário dinâmico — cada operação tem campos/validação genuinamente diferentes, um componente por operação ficou mais simples que um resolver Zod trocando de schema em runtime.
- Detalhe do produto (`/produtos/:id`) ganhou uma seção "Histórico de movimentações" (`ProdutoHistoricoEstoque`, últimos 10 registros).
- Nav do dashboard mostra "Estoque" só para quem tem `estoque.ler`.
- Sem seletor de fornecedor no formulário de entrada ainda — o módulo `Fornecedores` só chega na Etapa 7; o campo `fornecedorId` já existe no schema/DTO (nullable) para quando isso acontecer, mas a UI não tem de onde listar fornecedores ainda.

## Decisões / limitações conhecidas

- **Nova permissão `estoque.ajustarNegativo`**, adicionada ao catálogo/seed. A spec pede "permissão específica" para ajuste manual poder deixar o estoque negativo, mas não nomeia a chave nem diz quem deve tê-la — decisão: `ADMINISTRADOR` e `GERENTE` (via `PERMISSOES.map`/filtro existente no seed) têm por padrão, o papel `ESTOQUE` não (allowlist explícita no seed, não alterada) — menor privilégio por padrão, ajustável depois pelo próprio Administrador da empresa via `PATCH /papeis` (Etapa 3).
- **Mesma regra de saldo negativo aplicada a `PERDA`**, não só a `AJUSTE_MANUAL` — a spec só cita "ajuste manual" explicitamente na regra crítica, mas registrar uma perda maior que o estoque disponível é a mesma inconsistência; tratado com a mesma trava/permissão por consistência.
- **`quantidade` em `MovimentacaoEstoque` é sempre assinada** (positiva aumenta o estoque, negativa reduz), inclusive para `PERDA` (onde o DTO recebe um valor positivo, mas o que é persistido é o delta negativo). Facilita somar movimentações para relatórios futuros (Etapa 12) sem precisar de `CASE WHEN tipo = ...`.
- **`SAIDA_VENDA` não tem endpoint de escrita nesta etapa** — a spec diz que é "disparada pelo PDV/venda" (Etapa 9); o enum e a coluna já existem, só não há como criar essa movimentação manualmente pela API ainda (não faria sentido sem uma venda por trás).
