'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
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
import { Switch } from '@/components/ui/switch';
import { ApiError } from '@/lib/api/client';
import {
  useAtribuirPapel,
  useAtualizarUsuario,
  useDefinirAtivo,
  usePapeis,
  useRemoverPapel,
  useUsuario,
} from '../api/usuarios.queries';
import { atualizarUsuarioSchema, type AtualizarUsuarioInput } from '../schemas/usuario.schema';

export function UsuarioDetail({ usuarioId }: { usuarioId: string }) {
  const { data: usuario, isLoading, isError } = useUsuario(usuarioId);

  if (isLoading) return <p className="text-muted-foreground text-sm">Carregando...</p>;
  if (isError || !usuario)
    return <p className="text-destructive text-sm">Usuário não encontrado.</p>;

  return (
    <div className="max-w-lg space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{usuario.nome}</h1>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Ativo</span>
          <AtivoSwitch usuarioId={usuarioId} ativo={usuario.ativo} />
        </div>
      </div>

      <DadosForm usuarioId={usuarioId} nome={usuario.nome} email={usuario.email} />

      <PapeisManager usuarioId={usuarioId} papeisAtuais={usuario.papeis} />

      <dl className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <dt>Criado por</dt>
        <dd>{usuario.criadoPorNome ?? '—'}</dd>
        <dt>Última atualização por</dt>
        <dd>{usuario.atualizadoPorNome ?? '—'}</dd>
      </dl>
    </div>
  );
}

function AtivoSwitch({ usuarioId, ativo }: { usuarioId: string; ativo: boolean }) {
  const definirAtivo = useDefinirAtivo(usuarioId);
  return (
    <Switch
      checked={ativo}
      disabled={definirAtivo.isPending}
      onCheckedChange={(checked) => definirAtivo.mutate(checked)}
    />
  );
}

function DadosForm({ usuarioId, nome, email }: { usuarioId: string; nome: string; email: string }) {
  const atualizarUsuario = useAtualizarUsuario(usuarioId);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AtualizarUsuarioInput>({
    resolver: zodResolver(atualizarUsuarioSchema),
    defaultValues: { nome, email },
  });

  return (
    <form onSubmit={handleSubmit((input) => atualizarUsuario.mutate(input))} className="space-y-4">
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
      {atualizarUsuario.error && (
        <p className="text-destructive text-sm">
          {atualizarUsuario.error instanceof ApiError
            ? atualizarUsuario.error.message
            : 'Erro ao salvar.'}
        </p>
      )}
      <Button type="submit" disabled={atualizarUsuario.isPending}>
        {atualizarUsuario.isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  );
}

function PapeisManager({
  usuarioId,
  papeisAtuais,
}: {
  usuarioId: string;
  papeisAtuais: { id: string; nome: string }[];
}) {
  const { data: todosPapeis } = usePapeis();
  const atribuirPapel = useAtribuirPapel(usuarioId);
  const removerPapel = useRemoverPapel(usuarioId);
  const [novoPapelId, setNovoPapelId] = useState('');

  const idsAtuais = new Set(papeisAtuais.map((p) => p.id));
  const disponiveis = (todosPapeis ?? []).filter((p) => !idsAtuais.has(p.id));

  useEffect(() => {
    if (novoPapelId && idsAtuais.has(novoPapelId)) {
      setNovoPapelId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [papeisAtuais]);

  const erro = atribuirPapel.error ?? removerPapel.error;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium">Papéis</h2>

      <div className="flex flex-wrap gap-2">
        {papeisAtuais.map((papel) => (
          <Badge key={papel.id} variant="secondary" className="gap-1.5">
            {papel.nome}
            <button
              type="button"
              aria-label={`Remover papel ${papel.nome}`}
              className="hover:text-destructive"
              disabled={removerPapel.isPending}
              onClick={() => removerPapel.mutate(papel.id)}
            >
              ×
            </button>
          </Badge>
        ))}
        {papeisAtuais.length === 0 && (
          <span className="text-muted-foreground text-sm">Nenhum papel atribuído.</span>
        )}
      </div>

      {disponiveis.length > 0 && (
        <div className="flex items-center gap-2">
          <Select
            items={disponiveis.map((papel) => ({ value: papel.id, label: papel.nome }))}
            value={novoPapelId}
            onValueChange={(v) => setNovoPapelId(v ?? '')}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Adicionar papel..." />
            </SelectTrigger>
            <SelectContent>
              {disponiveis.map((papel) => (
                <SelectItem key={papel.id} value={papel.id}>
                  {papel.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!novoPapelId || atribuirPapel.isPending}
            onClick={() => novoPapelId && atribuirPapel.mutate(novoPapelId)}
          >
            Adicionar
          </Button>
        </div>
      )}

      {erro && (
        <p className="text-destructive text-sm">
          {erro instanceof ApiError ? erro.message : 'Erro ao atualizar papéis.'}
        </p>
      )}
    </div>
  );
}
