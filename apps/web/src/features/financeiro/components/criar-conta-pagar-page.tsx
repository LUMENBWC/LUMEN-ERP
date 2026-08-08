'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { useFornecedores } from '@/features/fornecedores/api/fornecedores.queries';
import { ApiError } from '@/lib/api/client';
import { useCategoriasDespesa, useCriarContaPagar } from '../api/financeiro.queries';
import { FinanceiroNav } from './financeiro-nav';

const schema = z.object({
  fornecedorId: z.string().uuid().nullable(),
  categoriaDespesaId: z.string().uuid().nullable(),
  descricao: z.string().trim().min(1, 'Descrição é obrigatória.').max(255),
  valorTotal: z.coerce.number().positive('Valor deve ser maior que zero.'),
  vencimento: z.string().min(1, 'Vencimento é obrigatório.'),
});
type FormValues = z.infer<typeof schema>;

export function CriarContaPagarPage() {
  const router = useRouter();
  const { data: fornecedores } = useFornecedores({ ativo: true, page: 1, perPage: 100 });
  const { data: categorias } = useCategoriasDespesa();
  const criarContaPagar = useCriarContaPagar();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fornecedorId: null, categoriaDespesaId: null, descricao: '', vencimento: '' },
  });
  const fornecedorId = watch('fornecedorId');
  const categoriaDespesaId = watch('categoriaDespesaId');

  async function onSubmit(input: FormValues) {
    await criarContaPagar.mutateAsync(input);
    router.push('/financeiro/contas-pagar');
  }

  return (
    <div className="space-y-4">
      <FinanceiroNav />
      <h1 className="text-xl font-semibold">Nova conta a pagar</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
        <div className="space-y-1">
          <Label htmlFor="descricao">Descrição</Label>
          <Input id="descricao" {...register('descricao')} />
          {errors.descricao && (
            <p className="text-destructive text-xs">{errors.descricao.message}</p>
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
            onValueChange={(v) => setValue('fornecedorId', v === 'nenhum' || !v ? null : v)}
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

        <div className="space-y-1">
          <Label htmlFor="categoriaDespesaId">Categoria de despesa (opcional)</Label>
          <Select
            items={[
              { value: 'nenhuma', label: 'Nenhuma' },
              ...(categorias ?? []).map((c) => ({ value: c.id, label: c.nome })),
            ]}
            value={categoriaDespesaId ?? 'nenhuma'}
            onValueChange={(v) => setValue('categoriaDespesaId', v === 'nenhuma' || !v ? null : v)}
          >
            <SelectTrigger id="categoriaDespesaId" className="w-full">
              <SelectValue placeholder="Nenhuma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nenhuma">Nenhuma</SelectItem>
              {categorias?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="valorTotal">Valor</Label>
            <Input id="valorTotal" type="number" step="0.01" min="0" {...register('valorTotal')} />
            {errors.valorTotal && (
              <p className="text-destructive text-xs">{errors.valorTotal.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="vencimento">Vencimento</Label>
            <Input id="vencimento" type="date" {...register('vencimento')} />
            {errors.vencimento && (
              <p className="text-destructive text-xs">{errors.vencimento.message}</p>
            )}
          </div>
        </div>

        {criarContaPagar.error && (
          <p className="text-destructive text-sm">
            {criarContaPagar.error instanceof ApiError
              ? criarContaPagar.error.message
              : 'Erro ao criar conta a pagar.'}
          </p>
        )}

        <Button type="submit" disabled={criarContaPagar.isPending}>
          {criarContaPagar.isPending ? 'Criando...' : 'Criar conta a pagar'}
        </Button>
      </form>
    </div>
  );
}
