# Pontos de Extensão (Etapa 13)

## O que existe

Escopo desta etapa: **só contratos e stubs**, sem implementação real, sem UI e sem novas rotas HTTP - nada aqui é consumido por nenhum módulo de negócio ainda. O objetivo é deixar a arquitetura pronta para plugar provedores externos no futuro (Ports & Adapters) sem exigir mudança nos módulos que um dia vão usá-los, só trocar o binding de DI.

**Backend (`apps/api/src/infra/providers`)** - quatro portas independentes, uma por integração futura prevista na especificação (Seções 3.10/3.11):

- **`fiscal/`** - `FiscalProvider` (`emitir`, `cancelar`, `consultarStatus`) para NF-e/NFC-e/NFS-e. `EmitirDocumentoFiscalInput` já usa os campos fiscais que existem desde a Etapa 4 (`ncm`/`cfop`/`cst` em `Produto`, `regimeTributario`/`inscricaoEstadual` em `Empresa`) - nenhum campo novo de schema foi necessário.
- **`pagamentos/`** - `PaymentGatewayProvider` (`criarCobranca`, `consultarStatus`, `cancelarCobranca`) para Banco Inter, Asaas, Mercado Pago, Stone.
- **`mensageria/`** - `MessagingProvider` (`enviarMensagem`) para WhatsApp Business API, com um enum fechado de templates (`ORCAMENTO_ENVIADO`, `VENDA_CONFIRMADA`, `COBRANCA_VENCENDO`) em vez de texto livre.
- **`logistica/`** - `ShippingProvider` (`calcularFrete`, `rastrear`) para Correios/Melhor Envio.
- Cada porta tem: um arquivo de tipos/interface (`*-provider.port.ts`), um token de DI (`Symbol`, mesmo padrão dos `*_REPOSITORY_FACTORY` já usados no projeto), uma implementação stub (`Stub*Provider`) e um `Module` que faz o binding `{ provide: TOKEN, useClass: Stub... }` e exporta o token.
- **`ProviderNaoImplementadoError`** - erro compartilhado pelas quatro stubs (`apps/api/src/infra/providers/provider-nao-implementado.error.ts`), mensagem no formato `"<Provider>: <operação> não implementado neste MVP"`. Toda operação de toda stub rejeita com esse erro (métodos `async` que só dão `throw`, garantindo rejeição de Promise em vez de exceção síncrona).
- Os quatro `*ProviderModule` são registrados no `AppModule` (ao lado de `AuditModule`/`AuthModule`) - isso prepara a injeção de dependência de ponta a ponta: quando um módulo de negócio futuro (ex.: `vendas` para NFC-e, `financeiro` para cobrança via gateway) quiser consumir uma porta, basta importar o `*ProviderModule` correspondente e injetar pelo token - trocar a stub por uma implementação real depois é só mudar o `useClass` do módulo, sem tocar em quem consome.

**Frontend** - nada nesta etapa. Não há funcionalidade para expor na UI (as portas não são consumidas por nenhum caso de uso ainda).

## Decisões / limitações conhecidas

- **Nenhuma credencial real, nenhuma chamada de rede** - só tipos e um `throw` padronizado, conforme pedido explicitamente na especificação (Seção 3.11).
- **Tokens são `Symbol`, não string** - evita colisão de nome entre os quatro provedores e seria o padrão a seguir se mais portas forem adicionadas depois.
- **Shape dos DTOs de cada porta é uma hipótese razoável, não um contrato validado com nenhum provedor real** - ao integrar de fato (ex.: Asaas para `PaymentGatewayProvider`), é esperado que os tipos precisem de ajuste para casar com a API do provedor escolhido; a porta muda, quem consome (ainda não existe) muda junto.
- **Sem testes de integração** (não haveria o que integrar) - só testes unitários confirmando que cada método de cada stub rejeita com `ProviderNaoImplementadoError`.
