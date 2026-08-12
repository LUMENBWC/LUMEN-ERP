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
import { useFecharCaixa } from '../api/caixa.queries';

const fecharCaixaSchema = z.object({
  valorFechamentoInformado: z.coerce.number().nonnegative('Valor não pode ser negativo.'),
  observacoes: z.string().trim().max(500).nullable().optional().default(null),
});
type FecharCaixaInput = z.infer<typeof fecharCaixaSchema>;

export function FecharCaixaDialog({
  valorEsperadoAtual,
  onFechado,
}: {
  valorEsperadoAtual: number;
  onFechado?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const fecharCaixa = useFecharCaixa();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FecharCaixaInput>({
    resolver: zodResolver(fecharCaixaSchema),
    defaultValues: { valorFechamentoInformado: valorEsperadoAtual, observacoes: null },
  });
  const valorInformado = watch('valorFechamentoInformado') || 0;
  const diferenca = valorInformado - valorEsperadoAtual;

  async function onSubmit(input: FecharCaixaInput) {
    await fecharCaixa.mutateAsync(input);
    reset();
    setOpen(false);
    onFechado?.();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) reset({ valorFechamentoInformado: valorEsperadoAtual, observacoes: null });
      }}
    >
      <DialogTrigger render={<Button type="button">Fechar caixa</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fechar caixa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Valor esperado em caixa:{' '}
            <span className="font-medium">R$ {valorEsperadoAtual.toFixed(2)}</span>
          </p>
          <div className="space-y-1">
            <Label htmlFor="valorFechamentoInformado">Valor contado</Label>
            <Input
              id="valorFechamentoInformado"
              type="number"
              step="0.01"
              min="0"
              {...register('valorFechamentoInformado')}
            />
            {errors.valorFechamentoInformado && (
              <p className="text-destructive text-xs">{errors.valorFechamentoInformado.message}</p>
            )}
          </div>
          <div className="border-border flex items-center justify-between border p-3 text-sm">
            <span>Diferença</span>
            <span
              className={
                diferenca === 0
                  ? 'font-semibold'
                  : diferenca > 0
                    ? 'font-semibold text-green-600'
                    : 'text-destructive font-semibold'
              }
            >
              R$ {diferenca.toFixed(2)}
            </span>
          </div>
          <div className="space-y-1">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Input id="observacoes" {...register('observacoes')} />
          </div>
          {fecharCaixa.error && (
            <p className="text-destructive text-sm">
              {fecharCaixa.error instanceof ApiError
                ? fecharCaixa.error.message
                : 'Erro ao fechar o caixa.'}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={fecharCaixa.isPending}>
              {fecharCaixa.isPending ? 'Fechando...' : 'Confirmar fechamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
