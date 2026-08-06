import { z } from 'zod';

export const criarCategoriaSchema = z.object({
  nome: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres.').max(255),
  categoriaPaiId: z.string().uuid().nullable().optional().default(null),
});

export type CriarCategoriaInput = z.infer<typeof criarCategoriaSchema>;
