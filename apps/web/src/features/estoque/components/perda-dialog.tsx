'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { useProdutos } from '@/features/produtos/api/produtos.queries';
import { ApiError } from '@/lib/api/client';
import { useRegistrarPerda } from '../api/estoque.queries';
import { registrarPerdaSchema, type RegistrarPerdaInput } from '../schemas/movimentacao.schema';

export function PerdaDialog({ trigger }: { trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const { data: produtos } = useProdutos({ ativo: true, page: 1, perPage: 100 });
  const registrarPerda = useRegistrarPerda();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RegistrarPerdaInput>({
    resolver: zodResolver(registrarPerdaSchema),
    defaultValues: { produtoId: '', motivo: '' },
  });
  const produtoId = watch('produtoId');

  async function onSubmit(input: RegistrarPerdaInput) {
    await registrarPerda.mutateAsync(input);
    reset({ produtoId: '', motivo: '', quantidade: undefined });
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
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar perda de estoque</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="produtoId">Produto</Label>
            <Select
              items={(produtos?.items ?? []).map((p) => ({
                value: p.id,
                label: `${p.nome} (${p.sku})`,
              }))}
              value={produtoId}
              onValueChange={(v) => v && setValue('produtoId', v)}
            >
              <SelectTrigger id="produtoId" className="w-full">
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {produtos?.items.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome} ({p.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.produtoId && (
              <p className="text-destructive text-xs">{errors.produtoId.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="quantidade">Quantidade perdida</Label>
            <Input id="quantidade" type="number" step="0.001" min="0" {...register('quantidade')} />
            {errors.quantidade && (
              <p className="text-destructive text-xs">{errors.quantidade.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="motivo">Motivo</Label>
            <Input id="motivo" {...register('motivo')} />
            {errors.motivo && <p className="text-destructive text-xs">{errors.motivo.message}</p>}
          </div>
          {registrarPerda.error && (
            <p className="text-destructive text-sm">
              {registrarPerda.error instanceof ApiError
                ? registrarPerda.error.message
                : 'Erro ao registrar perda.'}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={registrarPerda.isPending}>
              {registrarPerda.isPending ? 'Registrando...' : 'Registrar perda'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
