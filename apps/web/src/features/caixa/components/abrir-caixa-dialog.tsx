'use client';

import { zodResolver } from '@hookform/resolvers/zod';
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
import { useAbrirCaixa } from '../api/caixa.queries';

const abrirCaixaSchema = z.object({
  valorAbertura: z.coerce.number().nonnegative('Valor de abertura não pode ser negativo.'),
});
type AbrirCaixaInput = z.infer<typeof abrirCaixaSchema>;

export function AbrirCaixaDialog() {
  const abrirCaixa = useAbrirCaixa();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AbrirCaixaInput>({
    resolver: zodResolver(abrirCaixaSchema),
    defaultValues: { valorAbertura: 0 },
  });

  async function onSubmit(input: AbrirCaixaInput) {
    await abrirCaixa.mutateAsync(input.valorAbertura);
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button type="button">Abrir caixa</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir caixa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="valorAbertura">Valor de abertura</Label>
            <Input
              id="valorAbertura"
              type="number"
              step="0.01"
              min="0"
              {...register('valorAbertura')}
            />
            {errors.valorAbertura && (
              <p className="text-destructive text-xs">{errors.valorAbertura.message}</p>
            )}
          </div>
          {abrirCaixa.error && (
            <p className="text-destructive text-sm">
              {abrirCaixa.error instanceof ApiError
                ? abrirCaixa.error.message
                : 'Erro ao abrir o caixa.'}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={abrirCaixa.isPending}>
              {abrirCaixa.isPending ? 'Abrindo...' : 'Abrir caixa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
