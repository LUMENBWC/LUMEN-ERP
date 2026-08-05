import { z } from 'zod';

/**
 * Espelha os schemas Zod do backend
 * (apps/api/src/modules/usuarios/application/dto) - `packages/shared` (Zod
 * de fato compartilhado front/back) só entra a partir da Etapa 4, conforme
 * docs/architecture.md e ADR-0004.
 */
export const criarUsuarioSchema = z.object({
  authUserId: z.string().uuid('Informe um UUID válido do Supabase Auth.'),
  nome: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres.').max(255),
  email: z.string().trim().toLowerCase().email('E-mail inválido.'),
  filialId: z.string().uuid().nullable().optional().default(null),
  papelId: z.string().uuid('Selecione um papel.'),
});

export type CriarUsuarioInput = z.infer<typeof criarUsuarioSchema>;

export const atualizarUsuarioSchema = z.object({
  nome: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres.').max(255),
  email: z.string().trim().toLowerCase().email('E-mail inválido.'),
});

export type AtualizarUsuarioInput = z.infer<typeof atualizarUsuarioSchema>;
