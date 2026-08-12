'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { ErrorState, LoadingState } from '@/components/states';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ApiError } from '@/lib/api/client';
import { useCategoriasDespesa, useCriarCategoriaDespesa } from '../api/financeiro.queries';
import { FinanceiroNav } from './financeiro-nav';

const schema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório.').max(100),
});
type FormValues = z.infer<typeof schema>;

function NovaCategoriaDialog() {
  const [open, setOpen] = useState(false);
  const criarCategoria = useCriarCategoriaDespesa();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { nome: '' } });

  async function onSubmit(input: FormValues) {
    await criarCategoria.mutateAsync(input.nome);
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
      <DialogTrigger render={<Button type="button">Nova categoria</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova categoria de despesa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" {...register('nome')} />
            {errors.nome && <p className="text-destructive text-xs">{errors.nome.message}</p>}
          </div>
          {criarCategoria.error && (
            <p className="text-destructive text-sm">
              {criarCategoria.error instanceof ApiError
                ? criarCategoria.error.message
                : 'Erro ao criar categoria.'}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={criarCategoria.isPending}>
              {criarCategoria.isPending ? 'Criando...' : 'Criar categoria'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CategoriasDespesaPage() {
  const { data: categorias, isLoading, isError } = useCategoriasDespesa();

  return (
    <div className="space-y-4">
      <FinanceiroNav />
      <PageHeader title="Categorias de Despesa" action={<NovaCategoriaDialog />} />

      {isError && <ErrorState message="Não foi possível carregar as categorias." />}
      {isLoading && <LoadingState />}

      {categorias && (
        <div className="max-w-xl overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Criada em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-muted-foreground text-center">
                    Nenhuma categoria cadastrada.
                  </TableCell>
                </TableRow>
              )}
              {categorias.map((categoria) => (
                <TableRow key={categoria.id}>
                  <TableCell className="font-medium">{categoria.nome}</TableCell>
                  <TableCell>{new Date(categoria.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
