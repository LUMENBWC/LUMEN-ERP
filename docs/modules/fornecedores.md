# Fornecedores (Etapa 7)

## O que existe

**Backend (`apps/api/src/modules/fornecedores`)**

Mesmo padrão de camadas das etapas anteriores. Muito próximo do módulo `clientes` (Etapa 6), com duas diferenças pedidas pela spec (Secao 3.4):

- CRUD completo + ativar/desativar. `tipoPessoa` (padrão `JURIDICA`, mas aceita `FISICA`), documento único por empresa, endereço, observações. **Sem `whatsapp` nem `limiteCredito`** - o schema de `Fornecedor` nunca teve esses campos (só `Cliente` tem), então o módulo segue o schema, não copia campos que não existem.
- **Validação de CPF/CNPJ reaproveitada, não duplicada**: `domain/validar-documento.ts` de `clientes` é importado direto pelos use-cases daqui (`../../../clientes/domain/validar-documento`) - é uma função pura sem dependência de framework, então reaproveitar entre módulos é seguro e evita triplicar o algoritmo de dígito verificador. As classes de erro (`DocumentoInvalidoError` etc.) são **próprias** deste módulo, não as de `clientes` - importa porque o `FornecedorDomainErrorFilter` só captura `FornecedorDomainError`; usar a classe de outro módulo faria o erro escapar para o filtro genérico.
- **Produtos relacionados** (`FornecedorProduto`, N:N, já existia desde a Etapa 1): `POST /fornecedores/:id/produtos` e `DELETE /fornecedores/:id/produtos/:produtoId` para vincular/desvincular. Valida que o fornecedor e o produto existem e que o vínculo não é duplicado antes de ir ao banco (a unique constraint `[fornecedorId, produtoId]` também protegeria, mas a checagem de domínio dá uma mensagem melhor que "erro de banco").
- **Histórico de compras**: em vez de um endpoint novo, estendi o filtro que já existia em `GET /estoque/movimentacoes` (Etapa 5) para aceitar `fornecedorId` - a tabela `MovimentacaoEstoque.fornecedorId` já existia desde a Etapa 5, só não tinha como ser preenchida (não existia fornecedor pra escolher). O fornecedor válido agora também é **validado** ao registrar uma entrada (`FornecedorInvalidoError`, nova em `estoque/domain/estoque.errors.ts`) - antes disso não fazia sentido validar algo que não existia.
- **Permissões**: `fornecedores.ler` / `fornecedores.gerenciar`, já existiam no catálogo desde a Etapa 1.

**Frontend (`apps/web/src/features/fornecedores`)**

- `/fornecedores`, `/fornecedores/novo`, `/fornecedores/:id` - mesmo padrão de Clientes.
- Reaproveita `validarDocumento` e `formatarDocumento` (máscara) de `features/clientes` via import cross-feature, mesmo racional do backend - não duplica o algoritmo.
- Detalhe do fornecedor ganha duas seções novas: **produtos fornecidos** (badges com botão de remover + seletor para vincular um novo) e **histórico de compras** (últimas 10 entradas de estoque desse fornecedor).
- O diálogo de "Nova entrada" do Estoque (Etapa 5) agora tem um seletor de fornecedor opcional - gap fechado, documentado como pendência em `docs/modules/estoque.md` até aqui.
- Nav do dashboard mostra "Fornecedores" só para quem tem `fornecedores.ler`.

## Decisões / limitações conhecidas

- **Migration `fornecedores_createdById_fkey`/`fornecedores_updatedById_fkey`** aplicada via MCP da Supabase, mesma situação de `categorias`/`produtos`/`clientes` nas Etapas 5-6.
- **Sem gestão de contatos múltiplos** - a spec (Secao 3.4) menciona "contatos" de forma genérica; o schema só tem `telefone`/`email` simples (igual ao de `Cliente`), não uma lista. Não expandido além do que o schema já modelava.
