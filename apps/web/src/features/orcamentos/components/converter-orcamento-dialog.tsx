'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
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
import { useConverterOrcamento } from '@/features/vendas/api/vendas.queries';
import type { FormaPagamento } from '@/features/vendas/api/vendas.types';
import { FORMA_PAGAMENTO_LABEL } from '@/features/vendas/lib/labels-venda';
import { ApiError } from '@/lib/api/client';
import { formatarMoeda as moeda } from '@/lib/format';

const FORMAS: FormaPagamento[] = [
  'DINHEIRO',
  'PIX',
  'DEBITO',
  'CREDITO',
  'CREDITO_PARCELADO',
  'A_PRAZO',
];
const FORMAS_PARCELADAS: FormaPagamento[] = ['CREDITO_PARCELADO', 'A_PRAZO'];

const pagamentoSchema = z.object({
  formaPagamento: z.enum(['DINHEIRO', 'PIX', 'DEBITO', 'CREDITO', 'CREDITO_PARCELADO', 'A_PRAZO']),
  valor: z.coerce.number().positive('Valor deve ser maior que zero.'),
  parcelas: z.coerce.number().int().min(1).max(24).default(1),
});
const formSchema = z.object({
  pagamentos: z.array(pagamentoSchema).min(1, 'Informe ao menos uma forma de pagamento.'),
});
type FormValues = z.infer<typeof formSchema>;

export function ConverterOrcamentoDialog({
  orcamentoId,
  total,
}: {
  orcamentoId: string;
  total: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const converterOrcamento = useConverterOrcamento();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { pagamentos: [{ formaPagamento: 'DINHEIRO', valor: total, parcelas: 1 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'pagamentos' });
  const pagamentos = watch('pagamentos');

  const somaPagamentos = pagamentos.reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
  const divergente = Math.abs(somaPagamentos - total) > 0.001;

  async function onSubmit(values: FormValues) {
    const venda = await converterOrcamento.mutateAsync({
      orcamentoId,
      pagamentos: values.pagamentos.map((p) => ({
        formaPagamento: p.formaPagamento,
        valor: p.valor,
        parcelas: p.parcelas,
        bandeira: null,
      })),
    });
    setOpen(false);
    router.push(`/vendas/${venda.id}`);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen)
          reset({ pagamentos: [{ formaPagamento: 'DINHEIRO', valor: total, parcelas: 1 }] });
      }}
    >
      <DialogTrigger render={<Button type="button">Converter em venda</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Converter em venda — Total {moeda(total)}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3">
            {fields.map((field, index) => {
              const formaAtual = pagamentos[index]?.formaPagamento;
              return (
                <div key={field.id} className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label>Forma de pagamento</Label>
                    <Select
                      items={FORMAS.map((f) => ({ value: f, label: FORMA_PAGAMENTO_LABEL[f] }))}
                      value={formaAtual}
                      onValueChange={(v) =>
                        v && setValue(`pagamentos.${index}.formaPagamento`, v as FormaPagamento)
                      }
                    >
                      <SelectTrigger className="w-full">
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
                  <div className="w-28 space-y-1">
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`pagamentos.${index}.valor`)}
                    />
                  </div>
                  {formaAtual && FORMAS_PARCELADAS.includes(formaAtual) && (
                    <div className="w-24 space-y-1">
                      <Label>Parcelas</Label>
                      <Input
                        type="number"
                        step="1"
                        min="1"
                        max="24"
                        {...register(`pagamentos.${index}.parcelas`)}
                      />
                    </div>
                  )}
                  {fields.length > 1 && (
                    <button
                      type="button"
                      aria-label="Remover forma de pagamento"
                      className="text-muted-foreground hover:text-destructive mb-2"
                      onClick={() => remove(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ formaPagamento: 'DINHEIRO', valor: 0, parcelas: 1 })}
            >
              Adicionar forma de pagamento
            </Button>
            {errors.pagamentos?.message && (
              <p className="text-destructive text-xs">{errors.pagamentos.message}</p>
            )}
          </div>

          <div className="border-border flex items-center justify-between border p-3 text-sm">
            <span>Soma dos pagamentos</span>
            <span className={divergente ? 'text-destructive font-semibold' : 'font-semibold'}>
              {moeda(somaPagamentos)} / {moeda(total)}
            </span>
          </div>

          {converterOrcamento.error && (
            <p className="text-destructive text-sm">
              {converterOrcamento.error instanceof ApiError
                ? converterOrcamento.error.message
                : 'Erro ao converter o orçamento em venda.'}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={divergente || converterOrcamento.isPending}>
              {converterOrcamento.isPending ? 'Convertendo...' : 'Confirmar venda'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
