import { z } from 'zod';

export const registrarPagamentoSchema = z.object({
  valor: z.number().positive('Valor deve ser maior que zero.'),
});

export type RegistrarPagamentoDto = z.infer<typeof registrarPagamentoSchema>;
