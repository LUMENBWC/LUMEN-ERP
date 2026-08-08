import { z } from 'zod';

export const criarCategoriaDespesaSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório.').max(100),
});

export type CriarCategoriaDespesaDto = z.infer<typeof criarCategoriaDespesaSchema>;
