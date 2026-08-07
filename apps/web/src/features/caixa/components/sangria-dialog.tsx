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
import { useRegistrarSangria } from '../api/caixa.queries';

const sangriaSchema = z.object({
  valor: z.coerce.number().positive('Valor deve ser maior que zero.'),
  motivo: z.string().trim().min(1, 'Motivo é obrigatório para registrar uma sangria.').max(500),
});
type SangriaInput = z.infer<typeof sangriaSchema>;

export function SangriaDialog() {
  const [open, setOpen] = useState(false);
  const registrarSangria = useRegistrarSangria();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SangriaInput>({
    resolver: zodResolver(sangriaSchema),
    defaultValues: { valor: 0, motivo: '' },
  });

  async function onSubmit(input: SangriaInput) {
    await registrarSangria.mutateAsync(input);
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
            Sangria
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar sangria</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="valor">Valor</Label>
            <Input id="valor" type="number" step="0.01" min="0" {...register('valor')} />
            {errors.valor && <p className="text-destructive text-xs">{errors.valor.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="motivo">Motivo</Label>
            <Input id="motivo" {...register('motivo')} />
            {errors.motivo && <p className="text-destructive text-xs">{errors.motivo.message}</p>}
          </div>
          {registrarSangria.error && (
            <p className="text-destructive text-sm">
              {registrarSangria.error instanceof ApiError
                ? registrarSangria.error.message
                : 'Erro ao registrar sangria.'}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={registrarSangria.isPending}>
              {registrarSangria.isPending ? 'Registrando...' : 'Registrar sangria'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
