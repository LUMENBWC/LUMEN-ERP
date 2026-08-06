import { z } from 'zod';

const booleanQueryParam = z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => (value === undefined ? undefined : value === 'true'));

export const listarProdutosQuerySchema = z.object({
  busca: z.string().trim().min(1).max(255).optional(),
  categoriaId: z.string().uuid().optional(),
  ativo: booleanQueryParam,
  abaixoDoMinimo: booleanQueryParam,
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['nome', 'sku', 'precoVenda', 'estoqueAtual', 'createdAt']).default('nome'),
  sortDir: z.enum(['asc', 'desc']).default('asc'),
});

export type ListarProdutosQueryDto = z.infer<typeof listarProdutosQuerySchema>;
