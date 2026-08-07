'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api/client';
import { useRegistrarSuprimento } from '../api/caixa.queries';

const suprimentoSchema = z.object({
  valor: z.coerce.number().positive('Valor deve ser maior que zero.'),
  motivo: z.string().trim().max(500).nullable().optional().default(null),
});
type SuprimentoInput = z.infer<typeof suprimentoSchema>;

export function SuprimentoDialog() {
  const [open, setOpen] = useState(false);
  const registrarSuprimento = useRegistrarSuprimento();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SuprimentoInput>({
    resolver: zodResolver(suprimentoSchema),
    defaultValues: { valor: 0, motivo: null },
  });

  async function onSubmit(input: SuprimentoInput) {
    await registrarSuprimento.mutateAsync(input);
    reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button type="button" variant="outline">
            Suprimento
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar suprimento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="valor">Valor</Label>
            <Input id="valor" type="number" step="0.01" min="0" {...register('valor')} />
            {errors.valor && <p className="text-destructive text-xs">{errors.valor.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="motivo">Observação (opcional)</Label>
            <Input id="motivo" {...register('motivo')} />
          </div>
          {registrarSuprimento.error && (
            <p className="text-destructive text-sm">
              {registrarSuprimento.error instanceof ApiError
                ? registrarSuprimento.error.message
                : 'Erro ao registrar suprimento.'}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={registrarSuprimento.isPending}>
              {registrarSuprimento.isPending ? 'Registrando...' : 'Registrar suprimento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
