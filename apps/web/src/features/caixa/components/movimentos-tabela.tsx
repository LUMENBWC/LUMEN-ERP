import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { MovimentoCaixaResumo } from '../api/caixa.types';
import { TIPO_MOVIMENTO_LABEL } from '../lib/labels-caixa';

const ENTRADA = new Set(['ABERTURA', 'SUPRIMENTO', 'VENDA']);
const SAIDA = new Set(['SANGRIA']);

export function MovimentosTabela({ movimentos }: { movimentos: MovimentoCaixaResumo[] }) {
  if (movimentos.length === 0) {
    return <p className="text-muted-foreground text-sm">Nenhum movimento registrado.</p>;
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movimentos.map((movimento) => (
            <TableRow key={movimento.id}>
              <TableCell className="font-medium">{TIPO_MOVIMENTO_LABEL[movimento.tipo]}</TableCell>
              <TableCell
                className={
                  ENTRADA.has(movimento.tipo)
                    ? 'text-green-600'
                    : SAIDA.has(movimento.tipo)
                      ? 'text-destructive'
                      : undefined
                }
              >
                {ENTRADA.has(movimento.tipo) ? '+ ' : SAIDA.has(movimento.tipo) ? '- ' : ''}R${' '}
                {movimento.valor}
              </TableCell>
              <TableCell>{movimento.descricao ?? '—'}</TableCell>
              <TableCell>{movimento.usuarioNome}</TableCell>
              <TableCell>{new Date(movimento.data).toLocaleString('pt-BR')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
