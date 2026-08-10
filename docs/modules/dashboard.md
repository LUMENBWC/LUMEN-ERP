# Dashboard (Etapa 12)

## O que existe

Escopo desta etapa: agregações somente-leitura sobre dados já existentes (vendas, financeiro, caixa). Não cria nem altera nenhuma entidade - só consulta e soma. Por isso é o primeiro módulo do projeto sem nenhum domain error e sem filtro de exceção próprio no controller.

**Backend (`apps/api/src/modules/dashboard`)** - protegido pela mesma permissão `financeiro.ler` do módulo `financeiro` (não introduz uma permissão nova, já que é essencialmente uma visão agregada dos mesmos dados).

- `GET /dashboard/resumo?dataInicio&dataFim` - faturamento e custo dos produtos vendidos (de `Venda` com `status: CONCLUIDA`), despesas pagas (de `PagamentoPagavel` no período), lucro (`domain/calcular-lucro.ts`, pura: `faturamento - custoProdutosVendidos - despesasPagas`), quantidade de vendas, total a receber/a pagar com aging (a vencer vs. vencido).
- `GET /dashboard/produtos-mais-vendidos?dataInicio&dataFim&limit` - ranking por quantidade e por valor (dois `groupBy` paralelos sobre `VendaItem`), `limit` de 1 a 50 (default 10).
- `GET /dashboard/fluxo-caixa?dataInicio&dataFim` - entradas (`ABERTURA`+`SUPRIMENTO`+`VENDA`) e saídas (`SANGRIA`) de `MovimentoCaixa` no período, com saldo (`domain/calcular-fluxo-caixa.ts`, pura).
- **Período com default de 30 dias** (`domain/resolver-periodo.ts`, pura) - se `dataFim` não é informado, usa hoje; se `dataInicio` não é informado, usa `dataFim - 30 dias`. Os três endpoints aceitam os mesmos dois query params opcionais e aplicam a mesma regra.
- **Lucro considera só despesas já pagas, não despesas em aberto** - decisão consciente pra manter o número como "dinheiro que efetivamente saiu", coerente com o caixa. Uma conta a pagar em aberto não afeta o lucro do período até ser paga.
- **Aging calculado do mesmo jeito que em `financeiro`** (`estaVencida`/mesma lógica de corte por `vencimento < hoje`), mas aqui somado em nível de carteira inteira, não por conta individual - reaproveita a mesma regra de "vencido é sempre calculado, nunca persistido" (ver [`financeiro.md`](financeiro.md)).

**Frontend (`apps/web/src/features/dashboard`)**

- `DashboardFinanceiro` (renderizado em `/dashboard`, condicionado a `financeiro.ler` no array `me.permissoes` já buscado nessa página) - cards de faturamento/custo/despesas/lucro, blocos de a receber/a pagar com aging, cards de entradas/saídas/saldo do fluxo de caixa, e duas tabelas de produtos mais vendidos (por quantidade e por valor).
- Dois campos de data (`De`/`Até`) no topo, pré-preenchidos com o período default retornado pelo backend assim que a primeira resposta chega - trocar as datas refaz as três queries (`useResumoFinanceiro`, `useProdutosMaisVendidos`, `useFluxoCaixa`) em paralelo.
- Sem gráficos - só cards e tabelas, mesmo padrão visual do resto do app (nenhum outro módulo usa biblioteca de charting ainda).

## Decisões / limitações conhecidas

- **Sem cache/materialização** - toda consulta é recalculada a cada request, direto do Postgres. Aceitável no volume atual do projeto; se algum dia isso pesar, o candidato óbvio a pré-computar é o aging (é a única agregação que faz `findMany` + loop em JS em vez de agregação SQL).
- **`quantidadeVendas` do resumo conta vendas concluídas no período, não vendas com algum item entregue** - não há conceito de entrega parcial neste projeto.
- **Sem exportação (CSV/PDF)** - só visualização na tela.
