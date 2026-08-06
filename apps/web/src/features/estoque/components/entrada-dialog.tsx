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
import { useFornecedores } from '@/features/fornecedores/api/fornecedores.queries';
import { useProdutos } from '@/features/produtos/api/produtos.queries';
import { ApiError } from '@/lib/api/client';
import { useRegistrarEntrada } from '../api/estoque.queries';
import { registrarEntradaSchema, type RegistrarEntradaInput } from '../schemas/movimentacao.schema';

export function EntradaDialog({ trigger }: { trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const { data: produtos } = useProdutos({ ativo: true, page: 1, perPage: 100 });
  const { data: fornecedores } = useFornecedores({ ativo: true, page: 1, perPage: 100 });
  const registrarEntrada = useRegistrarEntrada();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RegistrarEntradaInput>({
    resolver: zodResolver(registrarEntradaSchema),
    defaultValues: { produtoId: '', fornecedorId: null, motivo: null },
  });
  const produtoId = watch('produtoId');
  const fornecedorId = watch('fornecedorId');

  async function onSubmit(input: RegistrarEntradaInput) {
    await registrarEntrada.mutateAsync(input);
    reset({
      produtoId: '',
      fornecedorId: null,
      motivo: null,
      quantidade: undefined,
      custoUnitario: undefined,
    });
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
          <DialogTitle>Registrar entrada de estoque</DialogTitle>
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
            <Label htmlFor="fornecedorId">Fornecedor (opcional)</Label>
            <Select
              items={[
                { value: 'nenhum', label: 'Nenhum' },
                ...(fornecedores?.items ?? []).map((f) => ({ value: f.id, label: f.nome })),
              ]}
              value={fornecedorId ?? 'nenhum'}
              onValueChange={(v) =>
                setValue('fornecedorId', v === 'nenhum' || v === null ? null : v)
              }
            >
              <SelectTrigger id="fornecedorId" className="w-full">
                <SelectValue placeholder="Nenhum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhum">Nenhum</SelectItem>
                {fornecedores?.items.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                step="0.001"
                min="0"
                {...register('quantidade')}
              />
              {errors.quantidade && (
                <p className="text-destructive text-xs">{errors.quantidade.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="custoUnitario">Custo unitário</Label>
              <Input
                id="custoUnitario"
                type="number"
                step="0.01"
                min="0"
                {...register('custoUnitario')}
              />
              {errors.custoUnitario && (
                <p className="text-destructive text-xs">{errors.custoUnitario.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="motivo">Observação (opcional)</Label>
            <Input id="motivo" {...register('motivo')} />
          </div>
          <p className="text-muted-foreground text-xs">
            O custo do produto é recalculado automaticamente como custo médio ponderado entre o
            estoque atual e esta entrada.
          </p>
          {registrarEntrada.error && (
            <p className="text-destructive text-sm">
              {registrarEntrada.error instanceof ApiError
                ? registrarEntrada.error.message
                : 'Erro ao registrar entrada.'}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={registrarEntrada.isPending}>
              {registrarEntrada.isPending ? 'Registrando...' : 'Registrar entrada'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
