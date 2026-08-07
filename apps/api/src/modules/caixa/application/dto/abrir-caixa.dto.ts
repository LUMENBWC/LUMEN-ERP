import { z } from 'zod';

export const abrirCaixaSchema = z.object({
  valorAbertura: z.number().nonnegative('Valor de abertura não pode ser negativo.'),
});

export type AbrirCaixaDto = z.infer<typeof abrirCaixaSchema>;
