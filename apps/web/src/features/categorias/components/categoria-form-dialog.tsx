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
import { ApiError } from '@/lib/api/client';
import { useAtualizarCategoria, useCategorias, useCriarCategoria } from '../api/categorias.queries';
import type { CategoriaResumo } from '../api/categorias.types';
import { criarCategoriaSchema, type CriarCategoriaInput } from '../schemas/categoria.schema';

interface Props {
  categoria?: CategoriaResumo;
  trigger: React.ReactElement;
}

export function CategoriaFormDialog({ categoria, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const { data: raizes } = useCategorias({ apenasRaiz: true, ativo: true, page: 1, perPage: 100 });
  const criar = useCriarCategoria();
  const atualizar = useAtualizarCategoria(categoria?.id ?? '');
  const mutation = categoria ? atualizar : criar;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CriarCategoriaInput>({
    resolver: zodResolver(criarCategoriaSchema),
    defaultValues: {
      nome: categoria?.nome ?? '',
      categoriaPaiId: categoria?.categoriaPaiId ?? null,
    },
  });

  const categoriaPaiId = watch('categoriaPaiId');
  const opcoesPai = (raizes?.items ?? []).filter((c) => c.id !== categoria?.id);

  async function onSubmit(input: CriarCategoriaInput) {
    await mutation.mutateAsync(input);
    reset(input);
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
          <DialogTitle>{categoria ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" {...register('nome')} />
            {errors.nome && <p className="text-destructive text-xs">{errors.nome.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="categoriaPaiId">Categoria pai (opcional)</Label>
            <Select
              items={[
                { value: 'nenhuma', label: 'Nenhuma (categoria raiz)' },
                ...opcoesPai.map((c) => ({ value: c.id, label: c.nome })),
              ]}
              value={categoriaPaiId ?? 'nenhuma'}
              onValueChange={(v) =>
                setValue('categoriaPaiId', v === 'nenhuma' || v === null ? null : v)
              }
            >
              <SelectTrigger id="categoriaPaiId" className="w-full">
                <SelectValue placeholder="Nenhuma (categoria raiz)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhuma">Nenhuma (categoria raiz)</SelectItem>
                {opcoesPai.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {mutation.error && (
            <p className="text-destructive text-sm">
              {mutation.error instanceof ApiError
                ? mutation.error.message
                : 'Erro ao salvar categoria.'}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
