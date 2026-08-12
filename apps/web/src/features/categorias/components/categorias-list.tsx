'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { ErrorState, LoadingState } from '@/components/states';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCategorias, useDefinirAtivoCategoria } from '../api/categorias.queries';
import { CategoriaFormDialog } from './categoria-form-dialog';

export function CategoriasList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useCategorias({ page, perPage: 50 });
  const totalPaginas = data ? Math.max(1, Math.ceil(data.total / 50)) : 1;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Categorias"
        action={<CategoriaFormDialog trigger={<Button>Nova categoria</Button>} />}
      />

      {isError && <ErrorState message="Não foi possível carregar as categorias." />}
      {isLoading && <LoadingState />}

      {data && (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria pai</TableHead>
                  <TableHead>Ativa</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground text-center">
                      Nenhuma categoria cadastrada.
                    </TableCell>
                  </TableRow>
                )}
                {data.items.map((categoria) => (
                  <TableRow key={categoria.id}>
                    <TableCell className="font-medium">{categoria.nome}</TableCell>
                    <TableCell>
                      {categoria.categoriaPaiNome ? (
                        <Badge variant="secondary">{categoria.categoriaPaiNome}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <AtivoToggle categoriaId={categoria.id} ativo={categoria.ativo} />
                    </TableCell>
                    <TableCell className="text-right">
                      <CategoriaFormDialog
                        categoria={categoria}
                        trigger={
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {data.total} categoria{data.total === 1 ? '' : 's'} - página {page} de {totalPaginas}
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

function AtivoToggle({ categoriaId, ativo }: { categoriaId: string; ativo: boolean }) {
  const definirAtivo = useDefinirAtivoCategoria(categoriaId);
  return (
    <Switch
      checked={ativo}
      disabled={definirAtivo.isPending}
      onCheckedChange={(checked) => definirAtivo.mutate(checked)}
    />
  );
}
