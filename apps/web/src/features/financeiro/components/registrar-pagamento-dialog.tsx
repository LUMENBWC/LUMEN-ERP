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
import { useRegistrarPagamento } from '../api/financeiro.queries';

const schema = z.object({
  valor: z.coerce.number().positive('Valor deve ser maior que zero.'),
});
type FormValues = z.infer<typeof schema>;

export function RegistrarPagamentoDialog({
  contaPagarId,
  saldoAberto,
}: {
  contaPagarId: string;
  saldoAberto: number;
}) {
  const [open, setOpen] = useState(false);
  const registrarPagamento = useRegistrarPagamento(contaPagarId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { valor: saldoAberto },
  });

  async function onSubmit(input: FormValues) {
    await registrarPagamento.mutateAsync(input.valor);
    reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) reset({ valor: saldoAberto });
      }}
    >
      <DialogTrigger render={<Button type="button">Registrar pagamento</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="valor">Valor</Label>
            <Input id="valor" type="number" step="0.01" min="0" {...register('valor')} />
            {errors.valor && <p className="text-destructive text-xs">{errors.valor.message}</p>}
          </div>
          {registrarPagamento.error && (
            <p className="text-destructive text-sm">
              {registrarPagamento.error instanceof ApiError
                ? registrarPagamento.error.message
                : 'Erro ao registrar pagamento.'}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={registrarPagamento.isPending}>
              {registrarPagamento.isPending ? 'Registrando...' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
