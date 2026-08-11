# PDV / Frente de Caixa (Etapa 9)

## O que existe

Etapa maior que as anteriores: toca três domínios ao mesmo tempo (venda, caixa, financeiro), mas só a fatia de cada um que a venda precisa pra funcionar de ponta a ponta - gestão completa de Caixa (fechamento, sangria, suprimento) é Etapa 10, e Financeiro completo (contas a pagar, dashboard, inadimplência) é Etapa 11.

**Backend - `apps/api/src/modules/vendas`** (módulo principal)

- `POST /vendas` finaliza uma venda numa única transação atômica: valida cliente/produtos, calcula totais, baixa estoque, gera título(s) financeiro(s), registra movimento de caixa se houver pagamento em dinheiro, grava `AuditLog`. Se qualquer passo falhar, tudo é revertido (mesma `tx` do início ao fim, via `TenantTransactionRunner`).
- `GET /vendas`, `GET /vendas/:id`, `POST /vendas/:id/cancelar`.
- **Sem `vendas.ler`** - o catálogo de permissões (seedado desde a Etapa 1) só tem `vendas.criar`/`vendas.aplicarDesconto`/`vendas.cancelar`. As rotas de leitura (`GET`) usam `vendas.criar` como gate, já que listar/ver vendas só faz sentido pra quem pode vender (é o que o próprio PDV precisa pra funcionar).
- **Totais calculados no servidor** (`domain/calcular-totais-venda.ts`), incluindo `custoTotal` (soma de quantidade × `precoCusto` de cada item, lido do produto sob lock - nunca vindo do cliente). Mesmo formato de `total do item`/`subtotal`/`total` do módulo de orçamentos.
- **Desconto exige permissão**: se `descontoGeral` ou o desconto de qualquer item for maior que zero, a venda só passa se o usuário tiver `vendas.aplicarDesconto` (`DescontoNaoAutorizadoError` caso contrário).
- **Múltiplas formas de pagamento por venda** (`domain/garantir-pagamentos-validos.ts`): a soma dos valores de todos os `pagamentos[]` tem que bater exatamente com o total - sem tolerância, sem "quase". Diverge, rejeita a venda inteira antes de tocar no banco.
- **Baixa de estoque reaproveitando o módulo `estoque`** (Etapa 5): `EstoqueRepositoryPort.registrarDelta` foi estendido pra aceitar `tipo: 'SAIDA_VENDA'` + `origemTipo`/`origemId` (rastreia a movimentação até a venda que a gerou). `VendasModule` importa `EstoqueModule` e injeta `ESTOQUE_REPOSITORY_FACTORY` diretamente - primeira vez no projeto que um módulo depende do repositório de outro via Nest DI (`exports` no módulo de origem), em vez de cada módulo reimplementar suas próprias queries. Fez sentido aqui porque a baixa de estoque de uma venda **é** literalmente uma movimentação de estoque (mesmo lock `SELECT ... FOR UPDATE`, mesmo cálculo de saldo), não uma leitura trivial como `clienteExiste`/`produtosExistentes` dos outros módulos.
- **Lock de produtos em ordem determinística**: `obterProdutosComLock` bloqueia (`FOR UPDATE`) todos os produtos do carrinho em ordem crescente de id, não na ordem em que foram adicionados ao carrinho - evita deadlock entre duas vendas concorrentes que compartilham produtos no carrinho em ordens diferentes.
- **Estoque insuficiente sempre bloqueia** (`EstoqueInsuficienteError`) - diferente do módulo `estoque`, aqui não existe um equivalente a `estoque.ajustarNegativo`: vender mais do que tem em estoque não é uma operação que faça sentido liberar por permissão.
- **Financeiro (mínimo)**: cada pagamento gera conta(s) a receber, direto na mesma transação da venda (sem um módulo `financeiro` próprio ainda - isso é Etapa 11):
  - `DINHEIRO`/`PIX`/`DEBITO`/`CREDITO` → **à vista**: um `ContaReceber` já `PAGO` (quitado no ato) + um `RecebimentoRecebivel` correspondente.
  - `CREDITO_PARCELADO`/`A_PRAZO` → **parcelado**: N `ContaReceber` com status `ABERTO`, vencimentos espaçados em **intervalos fixos de 30 dias** a partir da data da venda (`domain/calcular-parcelas.ts`; a última parcela absorve o resto da divisão, pra soma nunca divergir do total do pagamento). Não há campo pra escolher datas de vencimento customizadas na Etapa 9 - fica pra Etapa 11.
- **Caixa (mínimo, `apps/api/src/modules/caixa`)**: só o necessário pra venda em dinheiro funcionar.
  - `POST /caixa/abrir` (`caixa.abrir`) e `GET /caixa/sessoes/atual` (`vendas.criar` - qualquer um que possa vender precisa saber se o caixa tá aberto, mesmo sem poder abri-lo).
  - **Uma sessão de caixa aberta por empresa por vez**, não por operador/terminal - a spec (Secao 3.8) permite múltiplas sessões simultâneas por operador/terminal, mas isso pede uma UI de seleção de terminal que não existe ainda; simplificado pra "um caixa físico compartilhado", que é como a maioria dos pequenos negócios que esse MVP atende realmente opera. Documentado aqui como limitação conhecida, não escondido.
  - Pagamento em dinheiro sem caixa aberto → `CaixaFechadoError`. Pagamento em qualquer outra forma não exige caixa aberto.
  - Venda em dinheiro com caixa aberto registra um `MovimentoCaixa` tipo `VENDA` automaticamente.
  - Fechamento, sangria e suprimento **não existem ainda** - só abertura. Isso é o essencial da Etapa 10.
- **Conversão de orçamento em venda** (`POST /vendas` com `orcamentoId` no lugar de `clienteId`/`itens`/`descontoGeral`, implementada na Etapa 14): exige orçamento com status `APROVADO` (`OrcamentoNaoConversivelError` caso contrário) e reaproveita seus itens/cliente/desconto geral **do próprio orçamento**, ignorando qualquer `itens`/`clienteId`/`descontoGeral` que venha no corpo da requisição - só `pagamentos[]` é decidido no momento da conversão (o orçamento não guarda forma de pagamento). Tudo dentro da mesma transação de `FinalizarVendaUseCase`: cria a venda (com `venda.orcamentoId` preenchido, `@unique` - um orçamento nunca gera duas vendas), baixa estoque, gera título financeiro, registra caixa se houver dinheiro, e por fim marca o orçamento como `CONVERTIDO`. `VendasModule` importa `OrcamentosModule` (mesmo padrão de dependência cruzada via Nest DI de `EstoqueModule`/`CaixaModule`, ver acima) só para ler o orçamento - a escrita do novo status usa o repositório de orçamentos diretamente, não passa pelo use-case `AtualizarStatusOrcamentoUseCase` (cuja máquina de estados não inclui `CONVERTIDO` como destino, ver [`orcamentos.md`](orcamentos.md)).
- **Cancelamento de venda** (`POST /vendas/:id/cancelar`, permissão `vendas.cancelar`):
  - Reverte o estoque de cada item (`AJUSTE_MANUAL` positivo, rastreado via `origemId` até a venda cancelada).
  - Cancela (`status = CANCELADO`) qualquer `ContaReceber` da venda que ainda esteja `ABERTO`/`PARCIAL`.
  - **Não mexe em títulos já `PAGO`** nem no `MovimentoCaixa` da venda original - estornar dinheiro já recebido é uma operação financeira manual (uma sangria, registrada por um operador), não algo que "cancelar venda" deveria fabricar sozinho. Documentado como limitação conhecida.

**Frontend**

- `/pdv` (`features/pdv`) - a tela rápida de venda: busca de produto por nome/SKU/código de barras (`ProdutoBusca`, reaproveita `GET /produtos?busca=`, Enter adiciona ao carrinho direto se houver match exato de código de barras ou resultado único - pensado pra leitor de código de barras), carrinho editável (`CarrinhoTabela`, Zustand em `store/carrinho.store.ts` - estado de UI, não React Hook Form, porque o carrinho precisa sobreviver a re-renders e não é "um formulário" no sentido usual), seletor de cliente opcional, desconto geral, e `FinalizarVendaDialog` com formas de pagamento múltiplas dinâmicas (`useFieldArray`, mesmo padrão do formulário de itens de orçamento) que mostra em tempo real se a soma bate com o total antes de deixar confirmar.
- Banner de status do caixa no topo do PDV: aberto (mostra valor de abertura) ou fechado (com botão "Abrir caixa", `features/caixa`).
- `/vendas` e `/vendas/:id` (`features/vendas`) - histórico simples de vendas + detalhe com itens/pagamentos + botão cancelar (mesmo padrão de lista/detalhe dos módulos anteriores). Sem edição - venda finalizada não é editável, só cancelável.
- Botão "Converter em venda" (`ConverterOrcamentoDialog`, em `features/orcamentos`) aparece no detalhe do orçamento só quando `status === 'APROVADO'` - mesmo dialog de forma(s) de pagamento do `FinalizarVendaDialog` do PDV, mas sem seleção de itens/cliente (vêm do orçamento). Ao confirmar, navega para `/vendas/:id` da venda recém-criada.
- Nav do dashboard mostra "PDV" e "Vendas" só pra quem tem `vendas.criar`.

## Decisões / limitações conhecidas

- **Uma sessão de caixa por empresa** (não por operador/terminal) - ver acima. Se o negócio precisar de múltiplos caixas simultâneos, isso precisa ser revisitado na Etapa 10 junto com a UI de seleção de terminal.
- **Parcelas em intervalos fixos de 30 dias**, sem data de vencimento customizável - suficiente pro fluxo do PDV, mas provavelmente insuficiente pra negócios com regras de parcelamento mais específicas. Revisitar na Etapa 11.
- **Cancelamento não reverte dinheiro já recebido** - só estoque e títulos ainda em aberto. Reembolso é uma operação manual futura (Etapa 10/11), não parte do "cancelar venda".
- **Sem numeração sequencial de venda** (mesmo caso do PDF de orçamento) - identificação é só o UUID.
- **`vendas.ler` não existe** - leitura usa `vendas.criar` como gate. Se um papel precisar ver vendas sem poder criar (ex.: auditoria), isso pede uma permissão nova no catálogo.
