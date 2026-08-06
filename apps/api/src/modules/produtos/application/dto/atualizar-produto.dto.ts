import { z } from 'zod';
import { UNIDADES_MEDIDA } from './criar-produto.dto';

export const atualizarProdutoSchema = z
  .object({
    nome: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres.').max(255).optional(),
    descricao: z.string().trim().max(2000).nullable().optional(),
    sku: z.string().trim().min(1, 'SKU é obrigatório.').max(64).optional(),
    codigoBarras: z.string().trim().min(1).max(64).nullable().optional(),
    unidadeMedida: z.enum(UNIDADES_MEDIDA).optional(),
    categoriaId: z.string().uuid().nullable().optional(),
    precoCusto: z.number().nonnegative('Preço de custo não pode ser negativo.').optional(),
    precoVenda: z.number().nonnegative('Preço de venda não pode ser negativo.').optional(),
    estoqueMinimo: z.number().nonnegative('Estoque mínimo não pode ser negativo.').optional(),
    ncm: z.string().trim().max(16).nullable().optional(),
    cfop: z.string().trim().max(16).nullable().optional(),
    cst: z.string().trim().max(16).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export type AtualizarProdutoDto = z.infer<typeof atualizarProdutoSchema>;

export const definirAtivoProdutoSchema = z.object({ ativo: z.boolean() });
export type DefinirAtivoProdutoDto = z.infer<typeof definirAtivoProdutoSchema>;
