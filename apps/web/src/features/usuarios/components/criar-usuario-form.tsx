'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
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
import { ApiError } from '@/lib/api/client';
import { useCriarUsuario, usePapeis } from '../api/usuarios.queries';
import { criarUsuarioSchema, type CriarUsuarioInput } from '../schemas/usuario.schema';

export function CriarUsuarioForm() {
  const router = useRouter();
  const { data: papeis } = usePapeis();
  const criarUsuario = useCriarUsuario();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CriarUsuarioInput>({
    resolver: zodResolver(criarUsuarioSchema),
    defaultValues: { filialId: null },
  });

  const papelId = watch('papelId');

  async function onSubmit(input: CriarUsuarioInput) {
    try {
      const usuario = await criarUsuario.mutateAsync(input);
      router.push(`/usuarios/${usuario.id}`);
    } catch {
      // erro exibido abaixo via criarUsuario.error
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <div className="space-y-1">
        <Label htmlFor="authUserId">authUserId (Supabase Auth)</Label>
        <Input
          id="authUserId"
          placeholder="UUID de uma conta já existente no Supabase Auth"
          {...register('authUserId')}
        />
        {errors.authUserId && (
          <p className="text-destructive text-xs">{errors.authUserId.message}</p>
        )}
        <p className="text-muted-foreground text-xs">
          A pessoa precisa já ter uma conta no Supabase Auth - crie uma pelo painel do Supabase e
          cole o UUID aqui.
        </p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" {...register('nome')} />
        {errors.nome && <p className="text-destructive text-xs">{errors.nome.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="papelId">Papel inicial</Label>
        <Select
          value={papelId}
          onValueChange={(v) => v && setValue('papelId', v, { shouldValidate: true })}
        >
          <SelectTrigger id="papelId" className="w-full">
            <SelectValue placeholder="Selecione um papel" />
          </SelectTrigger>
          <SelectContent>
            {papeis?.map((papel) => (
              <SelectItem key={papel.id} value={papel.id}>
                {papel.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.papelId && <p className="text-destructive text-xs">{errors.papelId.message}</p>}
      </div>

      {criarUsuario.error && (
        <p className="text-destructive text-sm">
          {criarUsuario.error instanceof ApiError
            ? criarUsuario.error.message
            : 'Erro ao criar usuário.'}
        </p>
      )}

      <Button type="submit" disabled={criarUsuario.isPending}>
        {criarUsuario.isPending ? 'Criando...' : 'Criar usuário'}
      </Button>
    </form>
  );
}
