'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategorias } from '@/features/categorias/api/categorias.queries';
import { ApiError } from '@/lib/api/client';
import {
  criarProdutoSchema,
  type CriarProdutoInput,
  UNIDADES_MEDIDA,
} from '../schemas/produto.schema';

interface Props {
  defaultValues?: Partial<CriarProdutoInput>;
  onSubmit: (input: CriarProdutoInput) => Promise<unknown>;
  submitLabel: string;
  submittingLabel: string;
  error?: unknown;
  isPending: boolean;
}

export function ProdutoForm({
  defaultValues,
  onSubmit,
  submitLabel,
  submittingLabel,
  error,
  isPending,
}: Props) {
  const { data: categorias } = useCategorias({ ativo: true, page: 1, perPage: 100 });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CriarProdutoInput>({
    resolver: zodResolver(criarProdutoSchema),
    defaultValues: { unidadeMedida: 'UN', estoqueMinimo: 0, ...defaultValues },
  });

  const unidadeMedida = watch('unidadeMedida');
  const categoriaId = watch('categoriaId');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      <div className="space-y-1">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" {...register('nome')} />
        {errors.nome && <p className="text-destructive text-xs">{errors.nome.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="descricao">Descrição</Label>
        <Input id="descricao" {...register('descricao')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" {...register('sku')} />
          {errors.sku && <p className="text-destructive text-xs">{errors.sku.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="codigoBarras">Código de barras</Label>
          <Input id="codigoBarras" {...register('codigoBarras')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="unidadeMedida">Unidade de medida</Label>
          <Select
            value={unidadeMedida}
            onValueChange={(v) =>
              v && setValue('unidadeMedida', v as CriarProdutoInput['unidadeMedida'])
            }
          >
            <SelectTrigger id="unidadeMedida" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNIDADES_MEDIDA.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="categoriaId">Categoria</Label>
          <Select
            value={categoriaId ?? 'nenhuma'}
            onValueChange={(v) => setValue('categoriaId', v === 'nenhuma' || v === null ? null : v)}
          >
            <SelectTrigger id="categoriaId" className="w-full">
              <SelectValue placeholder="Sem categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nenhuma">Sem categoria</SelectItem>
              {categorias?.items.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label htmlFor="precoCusto">Preço de custo</Label>
          <Input id="precoCusto" type="number" step="0.01" min="0" {...register('precoCusto')} />
          {errors.precoCusto && (
            <p className="text-destructive text-xs">{errors.precoCusto.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="precoVenda">Preço de venda</Label>
          <Input id="precoVenda" type="number" step="0.01" min="0" {...register('precoVenda')} />
          {errors.precoVenda && (
            <p className="text-destructive text-xs">{errors.precoVenda.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="estoqueMinimo">Estoque mínimo</Label>
          <Input
            id="estoqueMinimo"
            type="number"
            step="0.001"
            min="0"
            {...register('estoqueMinimo')}
          />
        </div>
      </div>
      <p className="text-muted-foreground text-xs">
        A margem de lucro é calculada automaticamente a partir do custo e da venda - não é um campo
        editável.
      </p>

      {!!error && (
        <p className="text-destructive text-sm">
          {error instanceof ApiError ? error.message : 'Erro ao salvar produto.'}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? submittingLabel : submitLabel}
      </Button>
    </form>
  );
}
