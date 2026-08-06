import { z } from 'zod';

const booleanQueryParam = z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => (value === undefined ? undefined : value === 'true'));

export const listarFornecedoresQuerySchema = z.object({
  busca: z.string().trim().min(1).max(255).optional(),
  tipoPessoa: z.enum(['FISICA', 'JURIDICA']).optional(),
  ativo: booleanQueryParam,
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['nome', 'documento', 'createdAt']).default('nome'),
  sortDir: z.enum(['asc', 'desc']).default('asc'),
});

export type ListarFornecedoresQueryDto = z.infer<typeof listarFornecedoresQuerySchema>;
