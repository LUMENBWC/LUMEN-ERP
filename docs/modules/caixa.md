# Caixa (Etapa 10)

## O que existe

Completa o módulo `apps/api/src/modules/caixa`, cuja fatia mínima (abrir sessão, consultar sessão aberta) já existia desde a Etapa 9 - era o suficiente pra vender em dinheiro no PDV, mas nada além disso. Esta etapa adiciona o resto do ciclo de vida do caixa físico: sangria, suprimento, fechamento com conferência e histórico.

**Backend**

- `POST /caixa/abrir` (`caixa.abrir`), `GET /caixa/sessoes/atual` (`vendas.criar`) - já existiam.
- `POST /caixa/sangria` (`caixa.movimentar`) - retirada de dinheiro do caixa. Exige motivo (obrigatório, diferente do suprimento). Rejeita (`SaldoCaixaInsuficienteError`) se o valor pedido for maior que o saldo disponível no momento - calculado a partir do histórico de movimentos da sessão, não de um campo "saldo" armazenado à parte.
- `POST /caixa/suprimento` (`caixa.movimentar`) - adição de dinheiro ao caixa. Motivo opcional.
- `POST /caixa/fechar` (`caixa.fechar`) - fecha a sessão de caixa aberta da empresa:
  1. Soma todos os movimentos da sessão (`domain/calcular-valor-esperado.ts`: abertura + suprimentos + vendas em dinheiro − sangrias) para chegar ao **valor esperado**.
  2. Compara com o **valor informado** (a contagem física, enviada pelo operador) e grava a **diferença** (`valorInformado − valorEsperado`; positivo = sobra, negativo = falta).
  3. Marca a sessão como `FECHADO` e grava um `MovimentoCaixa` do tipo `FECHAMENTO` (não entra na conta do valor esperado de fechamentos futuros - é só o registro histórico do evento).
- `GET /caixa/sessoes` (`caixa.abrir`) - histórico paginado de sessões (abertas e fechadas).
- `GET /caixa/sessoes/:id` (`caixa.abrir`) - detalhe de uma sessão específica, com todos os seus movimentos e um `valorEsperadoAtual` recalculado a cada leitura (para uma sessão `ABERTO` é o saldo "ao vivo"; para uma `FECHADO` coincide com o `valorFechamentoEsperado` travado no fechamento).
- **Operação por sessão da empresa, não por operador/terminal individual** - mesma simplificação já assumida na Etapa 9 para abertura (documentada em `docs/modules/pdv.md`): sangria/suprimento/fechamento sempre agem sobre "a sessão aberta da empresa", não sobre uma sessão específica escolhida pelo operador. Continua fazendo sentido para o cenário de caixa único que este MVP atende.

**Onde ficam as "observações" do fechamento**: o schema (`CaixaSessao`) não tem uma coluna própria pra isso - só `valorFechamentoInformado`/`valorFechamentoEsperado`/`diferenca`. Em vez de migrar o schema pra adicionar uma coluna que só seria preenchida uma vez por sessão, as observações do fechamento vão para o campo `descricao` do próprio `MovimentoCaixa` tipo `FECHAMENTO` gerado no fechamento - o histórico de movimentos já é o lugar certo pra esse tipo de anotação textual, e evita uma migration para um único campo opcional.

**Frontend**

- `/caixa` (`features/caixa`) - painel principal: status da sessão atual (aberta/fechada), e se aberta, valor de abertura + valor esperado "ao vivo" + botões de Sangria/Suprimento/Fechar caixa + tabela dos movimentos da sessão. Se fechada, mostra o botão de abrir (mesmo fluxo da Etapa 9).
- `FecharCaixaDialog` pré-preenche o campo "valor contado" com o valor esperado atual (ajuste manual se a contagem física divergir) e mostra a diferença calculada em tempo real antes de confirmar.
- `/caixa/sessoes` - histórico paginado de sessões, com link pra cada uma.
- `/caixa/sessoes/:id` - detalhe de uma sessão (aberta ou fechada) com seus movimentos - reaproveita o mesmo componente de tabela de movimentos (`MovimentosTabela`) usado no painel principal.
- Nav do dashboard mostra "Caixa" só pra quem tem `caixa.abrir`.

## Decisões / limitações conhecidas

- **Uma sessão por empresa, não por operador/terminal** - ver acima; já era uma limitação documentada desde a Etapa 9, mantida aqui por consistência.
- **Sem edição/estorno de sangria ou suprimento** - um movimento registrado é imutável (como a spec pede: "histórico ... imutável"). Se um valor for lançado errado, a correção é um novo movimento compensatório, não uma edição do registro original - não implementado um fluxo dedicado pra isso ainda.
- **Reabertura de uma sessão fechada não existe** - uma vez fechada, uma sessão é permanente; a única forma de continuar operando é abrir uma nova sessão.
