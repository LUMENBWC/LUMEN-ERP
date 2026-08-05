import { z } from 'zod';

export const atualizarUsuarioSchema = z
  .object({
    nome: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres.').max(255).optional(),
    email: z.string().trim().toLowerCase().email('E-mail inválido.').optional(),
    filialId: z.string().uuid().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export type AtualizarUsuarioDto = z.infer<typeof atualizarUsuarioSchema>;

export const definirAtivoSchema = z.object({
  ativo: z.boolean(),
});

export type DefinirAtivoDto = z.infer<typeof definirAtivoSchema>;
