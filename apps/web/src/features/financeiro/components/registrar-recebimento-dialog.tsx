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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FORMA_PAGAMENTO_LABEL } from '@/features/vendas/lib/labels-venda';
import type { FormaPagamento } from '@/features/vendas/api/vendas.types';
import { ApiError } from '@/lib/api/client';
import { useRegistrarRecebimento } from '../api/financeiro.queries';

const FORMAS: FormaPagamento[] = [
  'DINHEIRO',
  'PIX',
  'DEBITO',
  'CREDITO',
  'CREDITO_PARCELADO',
  'A_PRAZO',
];

const schema = z.object({
  valor: z.coerce.number().positive('Valor deve ser maior que zero.'),
  formaPagamento: z.enum(['DINHEIRO', 'PIX', 'DEBITO', 'CREDITO', 'CREDITO_PARCELADO', 'A_PRAZO']),
});
type FormValues = z.infer<typeof schema>;

export function RegistrarRecebimentoDialog({
  contaReceberId,
  saldoAberto,
}: {
  contaReceberId: string;
  saldoAberto: number;
}) {
  const [open, setOpen] = useState(false);
  const registrarRecebimento = useRegistrarRecebimento(contaReceberId);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { valor: saldoAberto, formaPagamento: 'DINHEIRO' },
  });
  const formaPagamento = watch('formaPagamento');

  async function onSubmit(input: FormValues) {
    await registrarRecebimento.mutateAsync(input);
    reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) reset({ valor: saldoAberto, formaPagamento: 'DINHEIRO' });
      }}
    >
      <DialogTrigger render={<Button type="button">Registrar recebimento</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar recebimento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="valor">Valor</Label>
            <Input id="valor" type="number" step="0.01" min="0" {...register('valor')} />
            {errors.valor && <p className="text-destructive text-xs">{errors.valor.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="formaPagamento">Forma de pagamento</Label>
            <Select
              items={FORMAS.map((f) => ({ value: f, label: FORMA_PAGAMENTO_LABEL[f] }))}
              value={formaPagamento}
              onValueChange={(v) => v && setValue('formaPagamento', v as FormaPagamento)}
            >
              <SelectTrigger id="formaPagamento" className="w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {FORMAS.map((forma) => (
                  <SelectItem key={forma} value={forma}>
                    {FORMA_PAGAMENTO_LABEL[forma]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {registrarRecebimento.error && (
            <p className="text-destructive text-sm">
              {registrarRecebimento.error instanceof ApiError
                ? registrarRecebimento.error.message
                : 'Erro ao registrar recebimento.'}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={registrarRecebimento.isPending}>
              {registrarRecebimento.isPending ? 'Registrando...' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
