# Clientes (Etapa 6)

## O que existe

**Backend (`apps/api/src/modules/clientes`)**

Mesmo padrão de camadas das etapas anteriores.

- CRUD completo + ativar/desativar. `tipoPessoa` (FÍSICA/JURÍDICA), documento único por empresa (já garantido desde a Etapa 1 - `@@unique([empresaId, documento])`), endereço, `limiteCredito`, observações.
- **Validação de CPF/CNPJ** (`domain/validar-documento.ts`): não é só formato/tamanho - calcula os dígitos verificadores pelo algoritmo oficial da Receita Federal. Rejeita sequências como `000.000.000-00` (formato válido, documento inexistente). Aceita com ou sem máscara (só os dígitos entram no cálculo).
  - Ao atualizar um cliente, se só `documento` mudar (sem `tipoPessoa` no mesmo PATCH), a validação usa o `tipoPessoa` **atual** do cliente, buscado antes de validar - importante porque CPF e CNPJ têm algoritmos de dígito verificador diferentes.
- **`limiteCredito`** já modelado e editável, mas **sem nenhuma regra de bloqueio de venda** - a spec (Secao 3.3) pede isso "preparado mas desativado (feature flag)"; não há flag nem lógica de bloqueio ainda porque não existe _venda_ para bloquear (Etapa 9). Fica só o campo, pronto para quando o PDV existir.
- **Permissões**: `clientes.ler` / `clientes.gerenciar`, já existiam no catálogo desde a Etapa 1.
- **`inscricaoEstadual`** (opcional, implementado na Etapa 14): campo fiscal mínimo do lado do destinatário - a spec (Seção 3.10) pede campos fiscais em "produto/empresa/cliente"; `Produto` já tinha NCM/CFOP/CST e `Empresa` já tinha `regimeTributario`/`inscricaoEstadual` desde as Etapas 4/1, mas `Cliente` não tinha nenhum. Sem regra de validação de formato (varia por estado) - só texto livre opcional, igual ao campo homônimo em `Empresa`. **Só faz sentido pra pessoa jurídica** - o campo no schema aceita `null` pra qualquer `tipoPessoa` (sem constraint de banco amarrando os dois), mas o formulário só mostra o campo quando `tipoPessoa === 'JURIDICA'` e limpa o valor automaticamente se o tipo mudar pra `FISICA`.

**Frontend (`apps/web/src/features/clientes`)**

- `/clientes`, `/clientes/novo`, `/clientes/:id` - mesmo padrão de páginas de Produtos (Etapa 4), não o padrão de diálogo único de Categorias (formulário é grande o bastante para página própria).
- Validação de CPF/CNPJ duplicada no frontend (`schemas/validar-documento.ts`, mesmo algoritmo do backend) para feedback imediato no formulário - mesmo padrão de duplicação front/back já usado nas Etapas 3-5 (sem `packages/shared` ainda).
- Nav do dashboard mostra "Clientes" só para quem tem `clientes.ler`.

## Decisões / limitações conhecidas

- **Migration `clientes_createdById_fkey`/`clientes_updatedById_fkey`** aplicada via MCP da Supabase, mesma situação de `categorias`/`produtos` na Etapa 5 - a tabela é dona do role `postgres`, criada antes do `prisma_migrator` existir. Mesma situação de novo na Etapa 14 pra adicionar `inscricaoEstadual` (`20260811190000_cliente_inscricao_estadual`) - toda `ALTER TABLE` em `clientes` precisa desse caminho, não só `ADD CONSTRAINT`.
- **Histórico de compras implementado na Etapa 14, não na 6** - adiado corretamente aqui na Etapa 6 (nem `Orcamento` nem `Venda` existiam ainda), mas ninguém voltou depois que os dois módulos nasceram (Etapas 8 e 9) - só foi fechado durante a auditoria de "o que ficou pra trás" da Etapa 14. Sem endpoint novo: `GET /vendas?clienteId=` e `GET /orcamentos?clienteId=` já existiam desde que esses módulos foram criados, só faltava o frontend (`features/clientes/components/historico-compras.tsx`) buscar por eles. Mostra as 5 vendas e os 5 orçamentos mais recentes do cliente; cada seção some silenciosamente (sem mensagem de erro) se o usuário logado não tiver `vendas.criar`/`orcamentos.ler` - mesmo espírito de esconder links de nav sem permissão, aplicado a uma seção de leitura.
- **Erro de documento inválido mapeado para 409**, não 400/422 - o `ClienteDomainErrorFilter` segue o mesmo padrão binário 404 (não encontrado) / 409 (qualquer outro erro de domínio) já estabelecido em `produtos`/`categorias`/`estoque`; não há um terceiro bucket para "validação de negócio" ainda no filtro genérico.
