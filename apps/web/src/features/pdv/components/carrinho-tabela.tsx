'use client';

import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCarrinho } from '../store/carrinho.store';

export function CarrinhoTabela() {
  const itens = useCarrinho((state) => state.itens);
  const atualizarItem = useCarrinho((state) => state.atualizarItem);
  const removerItem = useCarrinho((state) => state.removerItem);

  if (itens.length === 0) {
    return <p className="text-muted-foreground text-sm">Carrinho vazio.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead className="w-24">Qtd.</TableHead>
            <TableHead className="w-32 text-right">Preço unit.</TableHead>
            <TableHead className="w-32 text-right">Desconto</TableHead>
            <TableHead className="w-28 text-right">Total</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {itens.map((item) => {
            const total = item.quantidade * item.precoUnitario - item.desconto;
            return (
              <TableRow key={item.produtoId}>
                <TableCell className="font-medium">{item.produtoNome}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={item.quantidade}
                    onChange={(event) =>
                      atualizarItem(item.produtoId, { quantidade: Number(event.target.value) || 0 })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.precoUnitario}
                    onChange={(event) =>
                      atualizarItem(item.produtoId, {
                        precoUnitario: Number(event.target.value) || 0,
                      })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.desconto}
                    onChange={(event) =>
                      atualizarItem(item.produtoId, { desconto: Number(event.target.value) || 0 })
                    }
                  />
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums">
                  {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    aria-label="Remover item"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removerItem(item.produtoId)}
                  >
                    ×
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
