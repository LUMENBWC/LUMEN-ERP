# Orçamentos (Etapa 8)

## O que existe

**Backend (`apps/api/src/modules/orcamentos`)**

Mesmo padrão de camadas das etapas anteriores.

- CRUD + fluxo de status: `POST /orcamentos`, `GET /orcamentos`, `GET /orcamentos/:id`, `PATCH /orcamentos/:id`, `PATCH /orcamentos/:id/status`, `POST /orcamentos/:id/cancelar`, `POST /orcamentos/:id/pdf`.
- **Itens como sub-recurso aninhado**: `criar`/`atualizar` recebem `itens[]` completo e o repositório substitui por inteiro (`deleteMany` + `create` aninhado) em vez de fazer patch item a item - mais simples e evita reconciliar diffs de array no backend.
- **Totais calculados no servidor** (`domain/calcular-totais-orcamento.ts`), nunca confiados ao cliente: `total do item = quantidade * precoUnitario - desconto`; `subtotal = soma dos itens`; `total = max(subtotal - descontoGeral, 0)`. O frontend mostra uma prévia com os mesmos números, mas só para exibição - quem persiste é sempre o backend.
- **Máquina de estados de status** (`domain/garantir-transicao-status-valida.ts`): `RASCUNHO → ENVIADO`; `ENVIADO → APROVADO | RECUSADO | EXPIRADO`; `APROVADO → EXPIRADO`. `CONVERTIDO` existe no enum mas **não é um destino válido do endpoint genérico de status** (`PATCH /orcamentos/:id/status`) - só é alcançado pelo fluxo dedicado de conversão em venda (`POST /vendas` com `orcamentoId`, módulo `vendas` - ver [`pdv.md`](pdv.md)), que atualiza o status por fora desse grafo. Tentar transicionar para `CONVERTIDO` (ou qualquer transição fora do grafo) via `PATCH /orcamentos/:id/status` continua lançando `TransicaoStatusInvalidaError`.
- **Edição só em rascunho**: `PATCH /orcamentos/:id` lança `OrcamentoNaoEditavelError` se o status não for `RASCUNHO` - depois de enviado, o orçamento é um documento que já pode ter sido mostrado ao cliente, não faz sentido reescrever silenciosamente.
- **Cancelamento via soft-delete** (`deletedAt`), não um campo `ativo` como nos outros módulos - `Orcamento` não tem `ativo` no schema; cancelar é semanticamente "não existe mais para consulta normal", então reaproveitar `deletedAt` (que já existia para auditoria) fez mais sentido que adicionar uma segunda flag. Só `RASCUNHO`/`ENVIADO` são canceláveis (`OrcamentoNaoCancelavelError` caso contrário).
- **Validação de cliente/produtos** (`application/validar-cliente-e-produtos.ts`): helper assíncrono compartilhado por `criar`/`atualizar`, checa que o cliente existe (`ClienteInvalidoError`) e que todo `produtoId` referenciado nos itens existe (`ProdutoInvalidoError`, uma por produto ausente).
- **Geração de PDF** (`application/gerar-pdf-orcamento-buffer.ts` + `infra/supabase-pdf-storage.ts`):
  - O PDF é montado em memória com `pdfkit` (empresa, cliente, itens, totais, observações) - biblioteca nova neste módulo, nenhum outro lugar do projeto gerava PDF antes.
  - Upload vai para um bucket **privado** do Supabase Storage (`orcamentos-pdf`, criado via SQL - `insert into storage.buckets`), usando `createAdminClient()` de `@supabase/server/core` (chave secreta, bypassa RLS). Caminho do objeto: `${empresaId}/${orcamentoId}.pdf`.
  - O endpoint `POST /orcamentos/:id/pdf` sempre regenera o PDF a partir dos dados atuais e sobrescreve o objeto (`upsert: true`) - não há cache; se o orçamento mudou desde a última geração, o PDF baixado reflete o estado atual.
  - `Orcamento.pdfUrl` guarda o **caminho no bucket**, não uma URL assinada - URLs assinadas expiram (aqui, 5 minutos) e não fariam sentido persistidas. A API sempre retorna uma URL assinada nova a cada chamada de `POST /orcamentos/:id/pdf`; o frontend abre essa URL numa nova aba.
  - Porta (`application/ports/pdf-storage.port.ts`) e implementação (`infra/supabase-pdf-storage.ts`) seguem o mesmo padrão de porta/adapter dos outros repositórios, então o use-case (`GerarPdfOrcamentoUseCase`) é testável com um mock, sem precisar de credenciais reais do Supabase nos testes.
- **Permissões**: `orcamentos.ler` / `orcamentos.gerenciar`, já existiam no catálogo desde a Etapa 1. Gerar PDF exige só `orcamentos.ler` (é uma ação de leitura/exportação, não de gestão).

**Frontend (`apps/web/src/features/orcamentos`)**

- `/orcamentos`, `/orcamentos/novo`, `/orcamentos/:id` - mesmo padrão dos módulos anteriores.
- Formulário usa `useFieldArray` (react-hook-form) pela primeira vez no projeto, para a lista dinâmica de itens. Selecionar um produto preenche `precoUnitario` automaticamente a partir do preço de venda cadastrado (editável depois).
- Detalhe do orçamento: enquanto `RASCUNHO`, mostra o formulário editável; qualquer outro status mostra uma tabela somente-leitura dos itens + totais.
- Ações de status (`orcamento-status-actions.tsx`) renderizam só os próximos status válidos para o status atual (mesmo grafo do backend, duplicado no frontend só para não oferecer botões que o backend rejeitaria) + botão "Cancelar orçamento" quando aplicável.
- Botão "Baixar PDF" no detalhe chama `POST /orcamentos/:id/pdf` e abre a URL assinada retornada em nova aba.
- Nav do dashboard mostra "Orçamentos" só para quem tem `orcamentos.ler`.

## Decisões / limitações conhecidas

- **Migration `orcamentos_createdById_fkey`/`orcamentos_updatedById_fkey`** aplicada via MCP da Supabase, mesma situação de `categorias`/`produtos`/`clientes`/`fornecedores` nas Etapas 5-7.
- **Conversão em venda implementada na Etapa 14, não na 9** - o módulo `vendas` existe desde a Etapa 9, mas o endpoint dedicado de conversão (`POST /vendas` com `orcamentoId`) só foi fechado durante o endurecimento da Etapa 14, quando um teste e2e do fluxo "aprovar orçamento → converter em venda" expôs que ninguém tinha voltado para implementá-lo. Ver [`pdv.md`](pdv.md) para os detalhes (reaproveita itens/cliente/desconto do orçamento, exige status `APROVADO`, marca `CONVERTIDO` na mesma transação).
- **PDF sem numeração sequencial** - o identificador usado no documento é os 8 primeiros caracteres do UUID do orçamento; o schema não tem um campo `numero` incremental. Se a spec exigir numeração sequencial legível (ex.: "ORC-0001"), isso precisa de um campo novo + lógica de sequência por empresa, não implementado agora.
- **Bucket de Storage sem política de expurgo** - PDFs sobrescrevem o mesmo caminho a cada geração, mas nada remove o objeto quando um orçamento é cancelado ou excluído de fato. Não é um problema de correção (o objeto órfão não é mais referenciado por nada acessível), só um ponto de limpeza futuro se o custo de armazenamento importar.
