import PDFDocument from 'pdfkit';
import type { DadosPdfOrcamento } from './ports/orcamentos.repository.port';

const STATUS_LABEL: Record<DadosPdfOrcamento['status'], string> = {
  RASCUNHO: 'Rascunho',
  ENVIADO: 'Enviado',
  APROVADO: 'Aprovado',
  RECUSADO: 'Recusado',
  EXPIRADO: 'Expirado',
  CONVERTIDO: 'Convertido',
};

function formatarMoeda(valor: { toNumber(): number }): string {
  return valor.toNumber().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(data: Date | null): string {
  return data ? data.toLocaleDateString('pt-BR') : '-';
}

export function gerarPdfOrcamentoBuffer(dados: DadosPdfOrcamento): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(16).text(dados.empresaRazaoSocial, { continued: false });
    doc.fontSize(9).text(`CNPJ/CPF: ${dados.empresaDocumento}`);
    doc.moveDown();

    doc.fontSize(14).text(`Orçamento #${dados.id.slice(0, 8)}`);
    doc.fontSize(9).text(`Status: ${STATUS_LABEL[dados.status]}`);
    doc.text(`Emitido em: ${formatarData(dados.createdAt)}`);
    doc.text(`Válido até: ${formatarData(dados.validade)}`);
    doc.moveDown();

    doc.fontSize(11).text('Cliente');
    doc.fontSize(9).text(dados.clienteNome);
    doc.text(`CNPJ/CPF: ${dados.clienteDocumento}`);
    doc.moveDown();

    doc.fontSize(11).text('Itens');
    doc.moveDown(0.5);
    for (const item of dados.itens) {
      doc
        .fontSize(9)
        .text(
          `${item.produtoNome} - Qtd: ${item.quantidade.toString()} x ${formatarMoeda(item.precoUnitario)} - Desconto: ${formatarMoeda(item.desconto)} = ${formatarMoeda(item.total)}`,
        );
    }
    doc.moveDown();

    doc.fontSize(9).text(`Subtotal: ${formatarMoeda(dados.subtotal)}`);
    doc.text(`Desconto geral: ${formatarMoeda(dados.descontoGeral)}`);
    doc.fontSize(11).text(`Total: ${formatarMoeda(dados.total)}`);

    if (dados.observacoes) {
      doc.moveDown();
      doc.fontSize(9).text(`Observações: ${dados.observacoes}`);
    }

    doc.end();
  });
}
