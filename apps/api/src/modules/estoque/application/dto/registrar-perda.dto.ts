import { z } from 'zod';

export const registrarPerdaSchema = z.object({
  produtoId: z.string().uuid(),
  quantidade: z.number().positive('Quantidade deve ser maior que zero.'),
  motivo: z.string().trim().min(1, 'Motivo é obrigatório para registrar uma perda.').max(500),
});

export type RegistrarPerdaDto = z.infer<typeof registrarPerdaSchema>;
