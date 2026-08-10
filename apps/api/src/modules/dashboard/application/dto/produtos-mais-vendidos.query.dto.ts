import { z } from 'zod';
import { periodoQuerySchema } from './periodo.query.dto';

export const produtosMaisVendidosQuerySchema = periodoQuerySchema.extend({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type ProdutosMaisVendidosQueryDto = z.infer<typeof produtosMaisVendidosQuerySchema>;
