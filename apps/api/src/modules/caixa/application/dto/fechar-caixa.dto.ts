import { z } from 'zod';

export const fecharCaixaSchema = z.object({
  valorFechamentoInformado: z.number().nonnegative('Valor informado não pode ser negativo.'),
  observacoes: z.string().trim().max(500).nullable().optional().default(null),
});

export type FecharCaixaDto = z.infer<typeof fecharCaixaSchema>;
