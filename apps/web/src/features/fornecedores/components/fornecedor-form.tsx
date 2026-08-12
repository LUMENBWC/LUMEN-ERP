'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatarDocumento } from '@/features/clientes/lib/formatar-documento';
import { ApiError } from '@/lib/api/client';
import { criarFornecedorSchema, type CriarFornecedorInput } from '../schemas/fornecedor.schema';

interface Props {
  defaultValues?: Partial<CriarFornecedorInput>;
  onSubmit: (input: CriarFornecedorInput) => Promise<unknown>;
  submitLabel: string;
  submittingLabel: string;
  error?: unknown;
  isPending: boolean;
}

const TIPO_PESSOA_ITEMS = [
  { value: 'JURIDICA', label: 'Pessoa jurídica' },
  { value: 'FISICA', label: 'Pessoa física' },
];

export function FornecedorForm({
  defaultValues,
  onSubmit,
  submitLabel,
  submittingLabel,
  error,
  isPending,
}: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CriarFornecedorInput>({
    resolver: zodResolver(criarFornecedorSchema),
    defaultValues: {
      tipoPessoa: 'JURIDICA',
      ...defaultValues,
      documento: formatarDocumento(
        defaultValues?.tipoPessoa ?? 'JURIDICA',
        defaultValues?.documento ?? '',
      ),
    },
  });

  const tipoPessoa = watch('tipoPessoa');
  const documento = watch('documento');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl">
      <Card className="gap-4 p-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="tipoPessoa">Tipo</Label>
            <Select
              items={TIPO_PESSOA_ITEMS}
              value={tipoPessoa}
              onValueChange={(v) => {
                if (!v) return;
                const novoTipo = v as CriarFornecedorInput['tipoPessoa'];
                setValue('tipoPessoa', novoTipo);
                setValue('documento', formatarDocumento(novoTipo, documento), {
                  shouldValidate: true,
                });
              }}
            >
              <SelectTrigger id="tipoPessoa" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPO_PESSOA_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="documento">{tipoPessoa === 'FISICA' ? 'CPF' : 'CNPJ'}</Label>
            <Input
              id="documento"
              inputMode="numeric"
              placeholder={tipoPessoa === 'FISICA' ? '000.000.000-00' : '00.000.000/0000-00'}
              value={documento}
              onChange={(e) =>
                setValue('documento', formatarDocumento(tipoPessoa, e.target.value), {
                  shouldValidate: true,
                })
              }
            />
            {errors.documento && (
              <p className="text-destructive text-xs">{errors.documento.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="nome">{tipoPessoa === 'FISICA' ? 'Nome' : 'Razão social'}</Label>
          <Input id="nome" {...register('nome')} />
          {errors.nome && <p className="text-destructive text-xs">{errors.nome.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" {...register('telefone')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-1">
            <Label htmlFor="logradouro">Logradouro</Label>
            <Input id="logradouro" {...register('logradouro')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="numero">Número</Label>
            <Input id="numero" {...register('numero')} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="complemento">Complemento</Label>
            <Input id="complemento" {...register('complemento')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="bairro">Bairro</Label>
            <Input id="bairro" {...register('bairro')} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" {...register('cidade')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="uf">UF</Label>
            <Input id="uf" maxLength={2} {...register('uf')} />
            {errors.uf && <p className="text-destructive text-xs">{errors.uf.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" {...register('cep')} />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="observacoes">Observações</Label>
          <Input id="observacoes" {...register('observacoes')} />
        </div>

        {!!error && (
          <p className="text-destructive text-sm">
            {error instanceof ApiError ? error.message : 'Erro ao salvar fornecedor.'}
          </p>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? submittingLabel : submitLabel}
        </Button>
      </Card>
    </form>
  );
}
