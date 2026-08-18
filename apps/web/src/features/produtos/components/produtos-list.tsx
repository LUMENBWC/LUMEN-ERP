'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buttonVariants, Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { ErrorState, LoadingState } from '@/components/states';
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
import { useCategorias } from '@/features/categorias/api/categorias.queries';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { useDefinirAtivoProduto, useProdutos } from '../api/produtos.queries';
import { formatarMoeda } from '../lib/formatar-moeda';
import { useProdutosFiltros } from '../store/produtos-filtros.store';

const PER_PAGE = 20;

export function ProdutosList() {
  const {
    busca,
    ativo,
    categoriaId,
    abaixoDoMinimo,
    page,
    setBusca,
    setAtivo,
    setCategoriaId,
    setAbaixoDoMinimo,
    setPage,
  } = useProdutosFiltros();
  const { data: categorias } = useCategorias({ ativo: true, page: 1, perPage: 100 });
  const buscaDebounced = useDebouncedValue(busca, 300);
  const { data, isLoading, isError } = useProdutos({
    busca: buscaDebounced || undefined,
    ativo,
    categoriaId,
    abaixoDoMinimo: abaixoDoMinimo || undefined,
    page,
    perPage: PER_PAGE,
  });

  const totalPaginas = data ? Math.max(1, Math.ceil(data.total / PER_PAGE)) : 1;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Produtos"
        action={
          <Link href="/produtos/novo" className={buttonVariants()}>
            Novo produto
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por nome, SKU ou código de barras..."
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
            { value: 'todas', label: 'Todas as categorias' },
            ...(categorias?.items ?? []).map((c) => ({ value: c.id, label: c.nome })),
          ]}
          value={categoriaId ?? 'todas'}
          onValueChange={(v) => setCategoriaId(v === 'todas' || v === null ? undefined : v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {categorias?.items.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={abaixoDoMinimo} onCheckedChange={setAbaixoDoMinimo} />
          Abaixo do estoque mínimo
        </label>
      </div>

      {isError && <ErrorState message="Não foi possível carregar os produtos." />}
      {isLoading && <LoadingState />}

      {data && (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Preço de venda</TableHead>
                  <TableHead className="text-right">Margem</TableHead>
                  <TableHead className="text-right">Estoque</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-muted-foreground text-center">
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {data.items.map((produto) => {
                  const abaixo =
                    Number(produto.estoqueMinimo) > 0 &&
                    Number(produto.estoqueAtual) < Number(produto.estoqueMinimo);
                  return (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">{produto.nome}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {produto.sku}
                      </TableCell>
                      <TableCell>{produto.categoriaNome ?? '—'}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatarMoeda(produto.precoVenda)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {(Number(produto.margemLucro) * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {produto.estoqueAtual} {produto.unidadeMedida}
                        {abaixo && (
                          <Badge variant="warning" className="ml-2">
                            baixo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <AtivoToggle produtoId={produto.id} ativo={produto.ativo} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/produtos/${produto.id}`}
                          className={buttonVariants({ variant: 'outline', size: 'sm' })}
                        >
                          Editar
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {data.total} produto{data.total === 1 ? '' : 's'} - página {page} de {totalPaginas}
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

function AtivoToggle({ produtoId, ativo }: { produtoId: string; ativo: boolean }) {
  const definirAtivo = useDefinirAtivoProduto(produtoId);
  return (
    <Switch
      checked={ativo}
      disabled={definirAtivo.isPending}
      onCheckedChange={(checked) => definirAtivo.mutate(checked)}
    />
  );
}
