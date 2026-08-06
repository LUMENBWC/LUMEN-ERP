import { z } from 'zod';

export const atualizarCategoriaSchema = z
  .object({
    nome: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres.').max(255).optional(),
    categoriaPaiId: z.string().uuid().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export type AtualizarCategoriaDto = z.infer<typeof atualizarCategoriaSchema>;

export const definirAtivoCategoriaSchema = z.object({ ativo: z.boolean() });
export type DefinirAtivoCategoriaDto = z.infer<typeof definirAtivoCategoriaSchema>;
