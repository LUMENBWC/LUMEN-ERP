import { z } from 'zod';

export const vincularProdutoSchema = z.object({
  produtoId: z.string().uuid(),
});

export type VincularProdutoDto = z.infer<typeof vincularProdutoSchema>;
