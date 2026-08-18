'use client';

import Link from 'next/link';
import { buttonVariants, Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { ErrorState, TableSkeleton } from '@/components/states';
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
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { useDefinirAtivoFornecedor, useFornecedores } from '../api/fornecedores.queries';
import { useFornecedoresFiltros } from '../store/fornecedores-filtros.store';

const PER_PAGE = 20;

export function FornecedoresList() {
  const { busca, ativo, tipoPessoa, page, setBusca, setAtivo, setTipoPessoa, setPage } =
    useFornecedoresFiltros();
  const buscaDebounced = useDebouncedValue(busca, 300);
  const { data, isLoading, isError } = useFornecedores({
    busca: buscaDebounced || undefined,
    ativo,
    tipoPessoa,
    page,
    perPage: PER_PAGE,
  });

  const totalPaginas = data ? Math.max(1, Math.ceil(data.total / PER_PAGE)) : 1;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fornecedores"
        action={
          <Link href="/fornecedores/novo" className={buttonVariants()}>
            Novo fornecedor
          </Link>
        }
      />

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

      {isError && <ErrorState message="Não foi possível carregar os fornecedores." />}
      {isLoading && <TableSkeleton columns={7} />}

      {data && (
        <>
          <div className="overflow-x-auto">
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
                      Nenhum fornecedor encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {data.items.map((fornecedor) => (
                  <TableRow key={fornecedor.id}>
                    <TableCell className="font-medium">{fornecedor.nome}</TableCell>
                    <TableCell>{fornecedor.documento}</TableCell>
                    <TableCell>{fornecedor.telefone ?? fornecedor.email ?? '—'}</TableCell>
                    <TableCell>
                      {fornecedor.cidade ? `${fornecedor.cidade}/${fornecedor.uf ?? ''}` : '—'}
                    </TableCell>
                    <TableCell>
                      <AtivoToggle fornecedorId={fornecedor.id} ativo={fornecedor.ativo} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/fornecedores/${fornecedor.id}`}
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
              {data.total} fornecedor{data.total === 1 ? '' : 'es'} - página {page} de{' '}
              {totalPaginas}
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

function AtivoToggle({ fornecedorId, ativo }: { fornecedorId: string; ativo: boolean }) {
  const definirAtivo = useDefinirAtivoFornecedor(fornecedorId);
  return (
    <Switch
      checked={ativo}
      disabled={definirAtivo.isPending}
      onCheckedChange={(checked) => definirAtivo.mutate(checked)}
    />
  );
}
