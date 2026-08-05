import { z } from 'zod';

export const atribuirPapelSchema = z.object({
  papelId: z.string().uuid('papelId deve ser um UUID válido.'),
});

export type AtribuirPapelDto = z.infer<typeof atribuirPapelSchema>;
