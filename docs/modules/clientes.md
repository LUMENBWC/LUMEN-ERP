# Clientes (Etapa 6)

## O que existe

**Backend (`apps/api/src/modules/clientes`)**

Mesmo padrão de camadas das etapas anteriores.

- CRUD completo + ativar/desativar. `tipoPessoa` (FÍSICA/JURÍDICA), documento único por empresa (já garantido desde a Etapa 1 - `@@unique([empresaId, documento])`), endereço, `limiteCredito`, observações.
- **Validação de CPF/CNPJ** (`domain/validar-documento.ts`): não é só formato/tamanho - calcula os dígitos verificadores pelo algoritmo oficial da Receita Federal. Rejeita sequências como `000.000.000-00` (formato válido, documento inexistente). Aceita com ou sem máscara (só os dígitos entram no cálculo).
  - Ao atualizar um cliente, se só `documento` mudar (sem `tipoPessoa` no mesmo PATCH), a validação usa o `tipoPessoa` **atual** do cliente, buscado antes de validar - importante porque CPF e CNPJ têm algoritmos de dígito verificador diferentes.
- **`limiteCredito`** já modelado e editável, mas **sem nenhuma regra de bloqueio de venda** - a spec (Secao 3.3) pede isso "preparado mas desativado (feature flag)"; não há flag nem lógica de bloqueio ainda porque não existe _venda_ para bloquear (Etapa 9). Fica só o campo, pronto para quando o PDV existir.
- **Permissões**: `clientes.ler` / `clientes.gerenciar`, já existiam no catálogo desde a Etapa 1.

**Frontend (`apps/web/src/features/clientes`)**

- `/clientes`, `/clientes/novo`, `/clientes/:id` - mesmo padrão de páginas de Produtos (Etapa 4), não o padrão de diálogo único de Categorias (formulário é grande o bastante para página própria).
- Validação de CPF/CNPJ duplicada no frontend (`schemas/validar-documento.ts`, mesmo algoritmo do backend) para feedback imediato no formulário - mesmo padrão de duplicação front/back já usado nas Etapas 3-5 (sem `packages/shared` ainda).
- Nav do dashboard mostra "Clientes" só para quem tem `clientes.ler`.

## Decisões / limitações conhecidas

- **Migration `clientes_createdById_fkey`/`clientes_updatedById_fkey`** aplicada via MCP da Supabase, mesma situação de `categorias`/`produtos` na Etapa 5 - a tabela é dona do role `postgres`, criada antes do `prisma_migrator` existir.
- **Sem "histórico de compras" ainda** - a spec (Secao 3.3) pede "listar vendas/orçamentos do cliente", mas nem `Orcamento` (Etapa 8) nem `Venda` (Etapa 9) têm módulo de escrita ainda. Mesmo racional já registrado em `produtos.md` para o histórico de movimentações de estoque antes da Etapa 5: sem endpoint stub, aparece quando essas etapas existirem.
- **Erro de documento inválido mapeado para 409**, não 400/422 - o `ClienteDomainErrorFilter` segue o mesmo padrão binário 404 (não encontrado) / 409 (qualquer outro erro de domínio) já estabelecido em `produtos`/`categorias`/`estoque`; não há um terceiro bucket para "validação de negócio" ainda no filtro genérico.
