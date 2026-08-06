import { z } from 'zod';

const booleanQueryParam = z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => (value === undefined ? undefined : value === 'true'));

export const listarCategoriasQuerySchema = z.object({
  busca: z.string().trim().min(1).max(255).optional(),
  ativo: booleanQueryParam,
  apenasRaiz: booleanQueryParam,
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(50),
});

export type ListarCategoriasQueryDto = z.infer<typeof listarCategoriasQuerySchema>;
