'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useOrcamentos } from '@/features/orcamentos/api/orcamentos.queries';
import {
  STATUS_LABEL as ORCAMENTO_STATUS_LABEL,
  STATUS_VARIANT as ORCAMENTO_STATUS_VARIANT,
} from '@/features/orcamentos/lib/status-orcamento';
import { useVendas } from '@/features/vendas/api/vendas.queries';
import {
  STATUS_LABEL as VENDA_STATUS_LABEL,
  STATUS_VARIANT as VENDA_STATUS_VARIANT,
} from '@/features/vendas/lib/labels-venda';

const PER_PAGE = 5;

export function HistoricoComprasCliente({ clienteId }: { clienteId: string }) {
  const vendas = useVendas({ clienteId, page: 1, perPage: PER_PAGE });
  const orcamentos = useOrcamentos({ clienteId, page: 1, perPage: PER_PAGE });

  // Sem `vendas.criar`/`orcamentos.ler` a API responde 403 - a seção
  // correspondente simplesmente não aparece, sem mostrar erro (mesmo
  // espírito de esconder links de nav sem permissão, aplicado a uma seção
  // de leitura em vez de uma ação).
  if (vendas.isError && orcamentos.isError) return null;

  return (
    <div className="space-y-6">
      {!vendas.isError && vendas.data && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium">Últimas vendas</h2>
          {vendas.data.items.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma venda deste cliente ainda.</p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendas.data.items.map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell>
                        <Badge variant={VENDA_STATUS_VARIANT[venda.status]}>
                          {VENDA_STATUS_LABEL[venda.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{venda.total}</TableCell>
                      <TableCell>{new Date(venda.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/vendas/${venda.id}`} className="text-sm underline">
                          Ver
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {vendas.data.total > PER_PAGE && (
            <p className="text-muted-foreground text-xs">
              Mostrando as {PER_PAGE} mais recentes de {vendas.data.total} vendas.
            </p>
          )}
        </div>
      )}

      {!orcamentos.isError && orcamentos.data && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium">Últimos orçamentos</h2>
          {orcamentos.data.items.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum orçamento deste cliente ainda.</p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orcamentos.data.items.map((orcamento) => (
                    <TableRow key={orcamento.id}>
                      <TableCell>
                        <Badge variant={ORCAMENTO_STATUS_VARIANT[orcamento.status]}>
                          {ORCAMENTO_STATUS_LABEL[orcamento.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{orcamento.total}</TableCell>
                      <TableCell>
                        {new Date(orcamento.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/orcamentos/${orcamento.id}`} className="text-sm underline">
                          Ver
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {orcamentos.data.total > PER_PAGE && (
            <p className="text-muted-foreground text-xs">
              Mostrando os {PER_PAGE} mais recentes de {orcamentos.data.total} orçamentos.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
