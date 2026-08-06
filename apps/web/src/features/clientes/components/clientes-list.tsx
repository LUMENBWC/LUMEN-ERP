'use client';

import Link from 'next/link';
import { buttonVariants, Button } from '@/components/ui/button';
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
import { useClientes, useDefinirAtivoCliente } from '../api/clientes.queries';
import { useClientesFiltros } from '../store/clientes-filtros.store';

const PER_PAGE = 20;

export function ClientesList() {
  const { busca, ativo, tipoPessoa, page, setBusca, setAtivo, setTipoPessoa, setPage } =
    useClientesFiltros();
  const { data, isLoading, isError } = useClientes({
    busca: busca || undefined,
    ativo,
    tipoPessoa,
    page,
    perPage: PER_PAGE,
  });

  const totalPaginas = data ? Math.max(1, Math.ceil(data.total / PER_PAGE)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Clientes</h1>
        <Link href="/clientes/novo" className={buttonVariants()}>
          Novo cliente
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por nome, documento ou e-mail..."
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
            { value: 'todos', label: 'Todos os tipos' },
            { value: 'FISICA', label: 'Pessoa física' },
            { value: 'JURIDICA', label: 'Pessoa jurídica' },
          ]}
          value={tipoPessoa ?? 'todos'}
          onValueChange={(v) =>
            setTipoPessoa(v === 'todos' || v === null ? undefined : (v as 'FISICA' | 'JURIDICA'))
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="FISICA">Pessoa física</SelectItem>
            <SelectItem value="JURIDICA">Pessoa jurídica</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <p className="text-destructive text-sm">Não foi possível carregar os clientes.</p>
      )}
      {isLoading && <p className="text-muted-foreground text-sm">Carregando...</p>}

      {data && (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Cidade/UF</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground text-center">
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {data.items.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                    <TableCell>{cliente.documento}</TableCell>
                    <TableCell>{cliente.telefone ?? cliente.email ?? '—'}</TableCell>
                    <TableCell>
                      {cliente.cidade ? `${cliente.cidade}/${cliente.uf ?? ''}` : '—'}
                    </TableCell>
                    <TableCell>
                      <AtivoToggle clienteId={cliente.id} ativo={cliente.ativo} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/clientes/${cliente.id}`}
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
              {data.total} cliente{data.total === 1 ? '' : 's'} - página {page} de {totalPaginas}
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

function AtivoToggle({ clienteId, ativo }: { clienteId: string; ativo: boolean }) {
  const definirAtivo = useDefinirAtivoCliente(clienteId);
  return (
    <Switch
      checked={ativo}
      disabled={definirAtivo.isPending}
      onCheckedChange={(checked) => definirAtivo.mutate(checked)}
    />
  );
}
