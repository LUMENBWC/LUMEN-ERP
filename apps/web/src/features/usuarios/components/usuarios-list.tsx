'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDefinirAtivo, usePapeis, useUsuarios } from '../api/usuarios.queries';
import { useUsuariosFiltros } from '../store/usuarios-filtros.store';

const PER_PAGE = 20;

export function UsuariosList() {
  const { busca, ativo, papelId, page, setBusca, setAtivo, setPapelId, setPage } =
    useUsuariosFiltros();
  const { data: papeisData } = usePapeis();
  const { data, isLoading, isError } = useUsuarios({
    busca: busca || undefined,
    ativo,
    papelId,
    page,
    perPage: PER_PAGE,
  });

  const totalPaginas = data ? Math.max(1, Math.ceil(data.total / PER_PAGE)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Usuários</h1>
        <Link href="/usuarios/novo" className={buttonVariants()}>
          Novo usuário
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar por nome ou e-mail..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="max-w-xs"
        />
        <Select
          items={[
            { value: 'todos', label: 'Todos os status' },
            { value: 'true', label: 'Ativos' },
            { value: 'false', label: 'Inativos' },
          ]}
          value={ativo === undefined ? 'todos' : String(ativo)}
          onValueChange={(v) => setAtivo(v === 'todos' || v === null ? undefined : v === 'true')}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="true">Ativos</SelectItem>
            <SelectItem value="false">Inativos</SelectItem>
          </SelectContent>
        </Select>
        <Select
          items={[
            { value: 'todos', label: 'Todos os papéis' },
            ...(papeisData ?? []).map((papel) => ({ value: papel.id, label: papel.nome })),
          ]}
          value={papelId ?? 'todos'}
          onValueChange={(v) => setPapelId(v === 'todos' || v === null ? undefined : v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Papel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os papéis</SelectItem>
            {papeisData?.map((papel) => (
              <SelectItem key={papel.id} value={papel.id}>
                {papel.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <p className="text-destructive text-sm">Não foi possível carregar os usuários.</p>
      )}
      {isLoading && <p className="text-muted-foreground text-sm">Carregando...</p>}

      {data && (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Papéis</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground text-center">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {data.items.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {usuario.papeis.map((papel) => (
                          <Badge key={papel.id} variant="secondary">
                            {papel.nome}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <AtivoToggle usuarioId={usuario.id} ativo={usuario.ativo} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/usuarios/${usuario.id}`}
                        className={buttonVariants({ variant: 'outline', size: 'sm' })}
                      >
                        Editar
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {data.total} usuário{data.total === 1 ? '' : 's'} - página {page} de {totalPaginas}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPaginas}
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AtivoToggle({ usuarioId, ativo }: { usuarioId: string; ativo: boolean }) {
  const definirAtivo = useDefinirAtivo(usuarioId);
  return (
    <Switch
      checked={ativo}
      disabled={definirAtivo.isPending}
      onCheckedChange={(checked) => definirAtivo.mutate(checked)}
    />
  );
}
