import { z } from 'zod';

export const criarUsuarioSchema = z.object({
  authUserId: z.string().uuid('authUserId deve ser um UUID válido.'),
  nome: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres.').max(255),
  email: z.string().trim().toLowerCase().email('E-mail inválido.'),
  filialId: z.string().uuid().nullable().optional().default(null),
  papelId: z.string().uuid('papelId deve ser um UUID válido.'),
});

export type CriarUsuarioDto = z.infer<typeof criarUsuarioSchema>;
