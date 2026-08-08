# Financeiro (Etapa 11)

## O que existe

Escopo desta etapa: contas a receber, contas a pagar e recebimentos/pagamentos (inclusive parciais). O dashboard agregado (faturamento, lucro, aging, produtos mais vendidos, fluxo de caixa) é a Etapa 12, separada de propósito.

**Backend (`apps/api/src/modules/financeiro`)** - único módulo cobrindo três agregados relacionados (contas a receber, contas a pagar, categorias de despesa), gerenciados pela mesma dupla de permissões (`financeiro.ler`/`financeiro.gerenciar`).

- **Contas a receber são só lidas/lançadas aqui, nunca criadas aqui** - quem cria é o módulo `vendas` (Etapa 9), na finalização de cada venda. `GET /financeiro/contas-receber`, `GET /financeiro/contas-receber/:id`, `POST /financeiro/contas-receber/:id/recebimentos` (recebimento total ou parcial).
- **Contas a pagar são criadas aqui** - título a fornecedor (`fornecedorId` opcional) e/ou despesa avulsa categorizada (`categoriaDespesaId` opcional, via `CategoriaDespesa` - CRUD simples de criar/listar, sem hierarquia). `POST /financeiro/contas-pagar`, `GET /financeiro/contas-pagar`, `GET /financeiro/contas-pagar/:id`, `POST /financeiro/contas-pagar/:id/pagamentos`, `POST /financeiro/contas-pagar/:id/cancelar`.
- **Status calculado a partir do valor lançado** (`domain/calcular-status-conta.ts`, pura, reaproveitada pelas duas pontas - receber e pagar, já que a regra é idêntica): `valorAcumulado === 0` → `ABERTO`; `0 < valorAcumulado < valorTotal` → `PARCIAL`; `valorAcumulado >= valorTotal` → `PAGO`. Um recebimento/pagamento nunca pode exceder o saldo em aberto da conta (`ValorLancamentoInvalidoError`) - isso mantiveria `valorRecebido > valorTotal`, o que não faz sentido.
- **Lock otimista por linha** (`SELECT ... FOR UPDATE`, mesmo padrão do estoque/vendas): dois recebimentos parciais simultâneos na mesma conta não perdem um ao outro.
- **"Vencida" é sempre calculado, nunca armazenado** (`domain/esta-vencida.ts`) - o enum `StatusConta` do schema tem um valor `VENCIDO`, mas nada nesse projeto transiciona uma conta pra esse status automaticamente (não existe cron/job agendado em nenhum módulo até aqui). Uma conta `ABERTO`/`PARCIAL` com vencimento no passado é reportada com `vencida: true` nas respostas da API, mas o `status` persistido continua `ABERTO`/`PARCIAL` - dá pra receber/pagar uma conta vencida normalmente, sem tratamento especial. O filtro `?vencido=true` nas listagens usa a mesma regra (`vencimento < hoje AND status IN (ABERTO, PARCIAL)`), calculada na hora da consulta.
- **Cancelamento de conta a pagar** só é permitido se ainda não recebeu nenhum pagamento (`ContaPagarNaoCancelavelError` caso contrário) - evita "cancelar" uma conta que já tem dinheiro comprometido nela; nesse caso o caminho é registrar o(s) pagamento(s) normalmente.
- **Sem cancelamento manual de conta a receber** - contas a receber só existem por causa de uma venda; cancelar uma venda (módulo `vendas`, Etapa 9) já cancela as contas a receber dela que ainda estejam em aberto. Não expor um cancelamento independente aqui evita dois caminhos divergentes pro mesmo efeito.

**Frontend (`apps/web/src/features/financeiro`)**

- `/financeiro/contas-receber` - lista com filtro por status e um atalho "Só vencidas"; `/financeiro/contas-receber/:id` - detalhe com histórico de recebimentos e o diálogo de registrar recebimento (valor pré-preenchido com o saldo em aberto).
- `/financeiro/contas-pagar` - lista com os mesmos filtros; `/financeiro/contas-pagar/novo` - formulário de criação (fornecedor e categoria via `Select` opcionais, reaproveitando `useFornecedores` de `features/fornecedores`); `/financeiro/contas-pagar/:id` - detalhe com histórico de pagamentos, diálogo de registrar pagamento e botão de cancelar (só aparece quando ainda é possível cancelar).
- `/financeiro/categorias-despesa` - lista simples + diálogo de criar categoria.
- `FinanceiroNav` - sub-navegação compartilhada entre as três páginas acima (evitou colocar 3 entradas separadas na nav principal do dashboard, que só tem um link "Financeiro").
- Forma de pagamento no recebimento reaproveita `FORMA_PAGAMENTO_LABEL`/tipo `FormaPagamento` de `features/vendas` em vez de duplicar - mesmo enum do backend (`vendas`, `financeiro` e `caixa` todos referenciam o mesmo `FormaPagamento` do schema).
- Nav do dashboard mostra "Financeiro" só pra quem tem `financeiro.ler`; criar conta a pagar/registrar pagamento/recebimento exigem `financeiro.gerenciar` nas rotas correspondentes (a UI não esconde os botões por permissão - mesmo padrão adotado desde o PDV, o backend é quem garante).

## Decisões / limitações conhecidas

- **Migration `contas_pagar_createdById_fkey`/`contas_pagar_updatedById_fkey`** aplicada via MCP da Supabase, mesma situação recorrente de `categorias`/`produtos`/`clientes`/`fornecedores`/`orcamentos` nas Etapas 5-9.
- **Sem edição de conta a pagar depois de criada** - só cancelamento (quando ainda não tem pagamento) ou registro de pagamentos. Corrigir um valor/vencimento errado hoje significa cancelar e criar de novo.
- **`VENCIDO` nunca é persistido** - ver acima. Se um relatório precisar de "todas as contas que estavam vencidas em uma data específica no passado" (não só agora), isso não é possível com o desenho atual, já que não existe histórico do status computado.
- **Categoria de despesa sem edição/exclusão pela UI** - só criar e listar. Renomear ou remover uma categoria com contas a pagar vinculadas não foi implementado (o schema usa `onDelete: SetNull`, então tecnicamente uma exclusão no banco não quebraria nada, mas não há endpoint pra isso ainda).
