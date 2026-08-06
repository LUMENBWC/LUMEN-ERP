'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useClientes } from '@/features/clientes/api/clientes.queries';
import { useProdutos } from '@/features/produtos/api/produtos.queries';
import { ApiError } from '@/lib/api/client';
import { criarOrcamentoSchema, type CriarOrcamentoInput } from '../schemas/orcamento.schema';

interface Props {
  defaultValues?: Partial<CriarOrcamentoInput>;
  onSubmit: (input: CriarOrcamentoInput) => Promise<unknown>;
  submitLabel: string;
  submittingLabel: string;
  error?: unknown;
  isPending: boolean;
}

function paraDataInput(valor: string | null | undefined): string {
  if (!valor) return '';
  return valor.slice(0, 10);
}

export function OrcamentoForm({
  defaultValues,
  onSubmit,
  submitLabel,
  submittingLabel,
  error,
  isPending,
}: Props) {
  const { data: clientes } = useClientes({ ativo: true, page: 1, perPage: 100 });
  const { data: produtos } = useProdutos({ ativo: true, page: 1, perPage: 100 });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CriarOrcamentoInput>({
    resolver: zodResolver(criarOrcamentoSchema),
    defaultValues: {
      itens: [],
      descontoGeral: 0,
      observacoes: null,
      ...defaultValues,
      validade: paraDataInput(defaultValues?.validade) || null,
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'itens' });

  const clienteId = watch('clienteId');
  const itens = watch('itens');
  const descontoGeral = watch('descontoGeral') || 0;

  const subtotal = itens.reduce(
    (acc, item) => acc + (item.quantidade || 0) * (item.precoUnitario || 0) - (item.desconto || 0),
    0,
  );
  const total = Math.max(subtotal - descontoGeral, 0);

  function adicionarItem() {
    append({ produtoId: '', produtoNome: '', quantidade: 1, precoUnitario: 0, desconto: 0 });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-4">
      <div className="space-y-1">
        <Label htmlFor="clienteId">Cliente</Label>
        <Select
          items={(clientes?.items ?? []).map((c) => ({ value: c.id, label: c.nome }))}
          value={clienteId}
          onValueChange={(v) => v && setValue('clienteId', v)}
        >
          <SelectTrigger id="clienteId" className="w-full">
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            {clientes?.items.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.clienteId && <p className="text-destructive text-xs">{errors.clienteId.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Itens</Label>
          <Button type="button" variant="outline" size="sm" onClick={adicionarItem}>
            Adicionar item
          </Button>
        </div>

        {fields.length > 0 && (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="w-24">Qtd.</TableHead>
                  <TableHead className="w-32">Preço unit.</TableHead>
                  <TableHead className="w-32">Desconto</TableHead>
                  <TableHead className="w-24">Total</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => {
                  const item = itens[index];
                  const itemTotal =
                    (item?.quantidade || 0) * (item?.precoUnitario || 0) - (item?.desconto || 0);
                  return (
                    <TableRow key={field.id}>
                      <TableCell>
                        <Select
                          items={(produtos?.items ?? []).map((p) => ({
                            value: p.id,
                            label: `${p.nome} (${p.sku})`,
                          }))}
                          value={item?.produtoId || ''}
                          onValueChange={(v) => {
                            if (!v) return;
                            setValue(`itens.${index}.produtoId`, v);
                            const produto = produtos?.items.find((p) => p.id === v);
                            if (produto) {
                              setValue(`itens.${index}.precoUnitario`, Number(produto.precoVenda));
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {produtos?.items.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.nome} ({p.sku})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.itens?.[index]?.produtoId && (
                          <p className="text-destructive text-xs">
                            {errors.itens[index]?.produtoId?.message}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.001"
                          min="0"
                          {...register(`itens.${index}.quantidade`)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...register(`itens.${index}.precoUnitario`)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...register(`itens.${index}.desconto`)}
                        />
                      </TableCell>
                      <TableCell className="text-sm">{itemTotal.toFixed(2)}</TableCell>
                      <TableCell>
                        <button
                          type="button"
                          aria-label="Remover item"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => remove(index)}
                        >
                          ×
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        {errors.itens?.message && (
          <p className="text-destructive text-xs">{errors.itens.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="descontoGeral">Desconto geral</Label>
          <Input
            id="descontoGeral"
            type="number"
            step="0.01"
            min="0"
            {...register('descontoGeral')}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="validade">Válido até</Label>
          <Input id="validade" type="date" {...register('validade')} />
        </div>
      </div>

      <div className="bg-muted flex gap-6 rounded-lg border p-4 text-sm">
        <div>
          <div className="text-muted-foreground">Subtotal</div>
          <div className="text-lg font-semibold">{subtotal.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Total</div>
          <div className="text-lg font-semibold">{total.toFixed(2)}</div>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="observacoes">Observações</Label>
        <Input id="observacoes" {...register('observacoes')} />
      </div>

      {!!error && (
        <p className="text-destructive text-sm">
          {error instanceof ApiError ? error.message : 'Erro ao salvar orçamento.'}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? submittingLabel : submitLabel}
      </Button>
    </form>
  );
}
