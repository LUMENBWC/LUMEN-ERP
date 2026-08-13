import { z } from 'zod';

export const UNIDADES_MEDIDA = ['UN', 'KG', 'G', 'L', 'ML', 'M', 'CX', 'PC'] as const;

/**
 * Campo de texto opcional que chega vazio do input e precisa virar `null`
 * para o backend (que espera `string | null`, não `""`).
 */
function vazioParaNulo(max: number) {
  return z
    .union([z.literal(''), z.string().trim().max(max)])
    .nullable()
    .optional()
    .default(null)
    .transform((v) => (v ? v : null));
}

export const criarProdutoSchema = z.object({
  nome: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres.').max(255),
  descricao: z.string().trim().max(2000).nullable().optional().default(null),
  sku: z.string().trim().min(1, 'SKU é obrigatório.').max(64),
  codigoBarras: z.string().trim().min(1).max(64).nullable().optional().default(null),
  unidadeMedida: z.enum(UNIDADES_MEDIDA).default('UN'),
  categoriaId: z.string().uuid().nullable().optional().default(null),
  precoCusto: z.coerce.number().nonnegative('Preço de custo não pode ser negativo.'),
  precoVenda: z.coerce.number().nonnegative('Preço de venda não pode ser negativo.'),
  estoqueMinimo: z.coerce.number().nonnegative('Estoque mínimo não pode ser negativo.').default(0),
  // Campos fiscais - o backend já os aceitava em POST/PATCH /produtos e os
  // devolvia em ProdutoDetalhado, mas não existiam no schema do front nem no
  // formulário, então ficavam permanentemente null e eram inalcançáveis pela
  // UI. `EmitirDocumentoFiscalInput` (porta FiscalProvider) depende deles.
  ncm: vazioParaNulo(16),
  cfop: vazioParaNulo(16),
  cst: vazioParaNulo(16),
});

export type CriarProdutoInput = z.infer<typeof criarProdutoSchema>;
