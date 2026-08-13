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

/**
 * Paleta espelhada do design system do front (`apps/web/src/app/globals.css`),
 * para o documento não parecer de outro produto. Só os tokens do tema claro -
 * PDF é sempre impresso em fundo claro.
 */
const COR = {
  texto: '#1d1f20',
  suave: '#6b6e70',
  borda: '#c9cacb',
  fundoSuave: '#e9e9ea',
  marca: '#5980a6',
  erro: '#b1524a',
} as const;

const MARGEM = 48;
const LARGURA_UTIL = 595.28 - MARGEM * 2; // A4 retrato

/** Colunas da tabela de itens: [produto, qtd, unitário, desconto, total]. */
const COLS = [214, 52, 90, 78, 85] as const;

function formatarMoeda(valor: { toNumber(): number }): string {
  return valor.toNumber().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarQuantidade(valor: { toNumber(): number }): string {
  return valor.toNumber().toLocaleString('pt-BR', { maximumFractionDigits: 3 });
}

function formatarData(data: Date | null): string {
  return data ? data.toLocaleDateString('pt-BR') : '—';
}

export function gerarPdfOrcamentoBuffer(dados: DadosPdfOrcamento): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: MARGEM, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const esquerda = MARGEM;
    const direita = MARGEM + LARGURA_UTIL;

    // ---------------------------------------------------------------------
    // Cabeçalho: emissor à esquerda, identificação do documento à direita
    // ---------------------------------------------------------------------
    doc.font('Helvetica-Bold').fontSize(15).fillColor(COR.texto);
    doc.text(dados.empresaRazaoSocial, esquerda, MARGEM, { width: COLS[0] + COLS[1] });
    doc.font('Helvetica').fontSize(8.5).fillColor(COR.suave);
    doc.text(`CNPJ/CPF ${dados.empresaDocumento}`, { width: COLS[0] + COLS[1] });

    doc.font('Helvetica-Bold').fontSize(20).fillColor(COR.marca);
    doc.text('ORÇAMENTO', esquerda, MARGEM - 2, { width: LARGURA_UTIL, align: 'right' });
    doc.font('Helvetica').fontSize(9).fillColor(COR.suave);
    doc.text(`Nº ${dados.id.slice(0, 8).toUpperCase()}`, esquerda, MARGEM + 22, {
      width: LARGURA_UTIL,
      align: 'right',
    });

    // Régua da marca separando cabeçalho do corpo.
    const yRegua = MARGEM + 52;
    doc.rect(esquerda, yRegua, LARGURA_UTIL, 2).fill(COR.marca);

    // ---------------------------------------------------------------------
    // Metadados: cliente à esquerda, dados do documento à direita
    // ---------------------------------------------------------------------
    let y = yRegua + 20;

    doc.font('Helvetica-Bold').fontSize(8).fillColor(COR.suave);
    doc.text('CLIENTE', esquerda, y);
    doc.font('Helvetica-Bold').fontSize(11).fillColor(COR.texto);
    doc.text(dados.clienteNome, esquerda, y + 12, { width: LARGURA_UTIL / 2 - 10 });
    doc.font('Helvetica').fontSize(9).fillColor(COR.suave);
    doc.text(`CNPJ/CPF ${dados.clienteDocumento}`, esquerda, y + 27, {
      width: LARGURA_UTIL / 2 - 10,
    });

    const xDir = esquerda + LARGURA_UTIL / 2;
    const larguraDir = LARGURA_UTIL / 2;
    const linhaMeta = (rotulo: string, valor: string, offset: number, cor: string = COR.texto) => {
      doc.font('Helvetica').fontSize(9).fillColor(COR.suave);
      doc.text(rotulo, xDir, y + offset, { width: larguraDir - 110, align: 'right' });
      doc.font('Helvetica-Bold').fillColor(cor);
      doc.text(valor, xDir, y + offset, { width: larguraDir, align: 'right' });
    };
    const statusEhNegativo = dados.status === 'RECUSADO' || dados.status === 'EXPIRADO';
    linhaMeta('Status', STATUS_LABEL[dados.status], 0, statusEhNegativo ? COR.erro : COR.marca);
    linhaMeta('Emitido em', formatarData(dados.createdAt), 15);
    linhaMeta('Válido até', formatarData(dados.validade), 30);

    y += 56;

    // ---------------------------------------------------------------------
    // Tabela de itens
    // ---------------------------------------------------------------------
    const xs = [esquerda];
    for (const largura of COLS) xs.push(xs[xs.length - 1] + largura);

    const cabecalhoTabela = (yTopo: number): number => {
      doc.rect(esquerda, yTopo, LARGURA_UTIL, 20).fill(COR.fundoSuave);
      doc.font('Helvetica-Bold').fontSize(8).fillColor(COR.suave);
      doc.text('PRODUTO', xs[0] + 8, yTopo + 6.5, { width: COLS[0] - 12 });
      doc.text('QTD', xs[1], yTopo + 6.5, { width: COLS[1] - 6, align: 'right' });
      doc.text('UNITÁRIO', xs[2], yTopo + 6.5, { width: COLS[2] - 6, align: 'right' });
      doc.text('DESCONTO', xs[3], yTopo + 6.5, { width: COLS[3] - 6, align: 'right' });
      doc.text('TOTAL', xs[4], yTopo + 6.5, { width: COLS[4] - 8, align: 'right' });
      return yTopo + 20;
    };

    y = cabecalhoTabela(y);

    const LIMITE_RODAPE = 760;
    for (const item of dados.itens) {
      const alturaNome = doc
        .font('Helvetica')
        .fontSize(9)
        .heightOfString(item.produtoNome, {
          width: COLS[0] - 12,
        });
      const alturaLinha = Math.max(22, alturaNome + 12);

      // Quebra de página preservando o cabeçalho da tabela.
      if (y + alturaLinha > LIMITE_RODAPE) {
        doc.addPage();
        y = cabecalhoTabela(MARGEM);
      }

      doc.moveTo(esquerda, y).lineTo(direita, y).strokeColor(COR.borda).lineWidth(0.5).stroke();

      const yTexto = y + 6;
      doc.font('Helvetica').fontSize(9).fillColor(COR.texto);
      doc.text(item.produtoNome, xs[0] + 8, yTexto, { width: COLS[0] - 12 });
      doc.text(formatarQuantidade(item.quantidade), xs[1], yTexto, {
        width: COLS[1] - 6,
        align: 'right',
      });
      doc.text(formatarMoeda(item.precoUnitario), xs[2], yTexto, {
        width: COLS[2] - 6,
        align: 'right',
      });
      doc.fillColor(item.desconto.toNumber() > 0 ? COR.erro : COR.suave);
      doc.text(formatarMoeda(item.desconto), xs[3], yTexto, { width: COLS[3] - 6, align: 'right' });
      doc.font('Helvetica-Bold').fillColor(COR.texto);
      doc.text(formatarMoeda(item.total), xs[4], yTexto, { width: COLS[4] - 8, align: 'right' });

      y += alturaLinha;
    }

    doc.moveTo(esquerda, y).lineTo(direita, y).strokeColor(COR.borda).lineWidth(0.5).stroke();

    // ---------------------------------------------------------------------
    // Totais — caixa única à direita: subtotal e desconto sobre fundo suave,
    // total em faixa da marca. Rótulo e valor compartilham o mesmo recuo
    // interno das duas partes, para as colunas ficarem alinhadas entre si e
    // com a faixa do total (antes as linhas de cima ficavam soltas, sem
    // recuo, desalinhadas da faixa).
    // ---------------------------------------------------------------------
    y += 18;
    const larguraTotais = 240;
    const xTotais = direita - larguraTotais;
    const RECUO = 14;
    const ALTURA_LINHA = 22;
    const ALTURA_TOTAL = 34;

    /** Centraliza verticalmente o texto na faixa, em vez de chutar offset. */
    const textoCentralizado = (
      texto: string,
      xInicio: number,
      yFaixa: number,
      alturaFaixa: number,
      largura: number,
      alinhamento: 'left' | 'right',
    ) => {
      const yTexto = yFaixa + (alturaFaixa - doc.currentLineHeight()) / 2;
      doc.text(texto, xInicio, yTexto, { width: largura, align: alinhamento });
    };

    const linhas: { rotulo: string; valor: string; cor: string }[] = [
      { rotulo: 'Subtotal dos produtos', valor: formatarMoeda(dados.subtotal), cor: COR.texto },
    ];
    if (dados.descontoGeral.toNumber() > 0) {
      linhas.push({
        rotulo: 'Desconto geral',
        valor: `− ${formatarMoeda(dados.descontoGeral)}`,
        cor: COR.erro,
      });
    }

    const alturaBloco = linhas.length * ALTURA_LINHA;

    // Fundo suave + contorno das linhas superiores.
    doc.rect(xTotais, y, larguraTotais, alturaBloco).fill(COR.fundoSuave);
    doc.rect(xTotais, y, larguraTotais, alturaBloco).strokeColor(COR.borda).lineWidth(0.5).stroke();

    linhas.forEach((linha, indice) => {
      const yLinha = y + indice * ALTURA_LINHA;
      if (indice > 0) {
        doc
          .moveTo(xTotais + RECUO, yLinha)
          .lineTo(xTotais + larguraTotais - RECUO, yLinha)
          .strokeColor(COR.borda)
          .lineWidth(0.5)
          .stroke();
      }
      doc.font('Helvetica').fontSize(9.5).fillColor(COR.suave);
      textoCentralizado(linha.rotulo, xTotais + RECUO, yLinha, ALTURA_LINHA, 130, 'left');
      doc.font('Helvetica-Bold').fillColor(linha.cor);
      textoCentralizado(
        linha.valor,
        xTotais + RECUO,
        yLinha,
        ALTURA_LINHA,
        larguraTotais - RECUO * 2,
        'right',
      );
    });

    y += alturaBloco;

    // Faixa do total, encostada no bloco acima (sem respiro entre as duas).
    doc.rect(xTotais, y, larguraTotais, ALTURA_TOTAL).fill(COR.marca);
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff');
    textoCentralizado('TOTAL', xTotais + RECUO, y, ALTURA_TOTAL, 100, 'left');
    doc.fontSize(14);
    textoCentralizado(
      formatarMoeda(dados.total),
      xTotais + RECUO,
      y,
      ALTURA_TOTAL,
      larguraTotais - RECUO * 2,
      'right',
    );

    y += ALTURA_TOTAL + 22;

    // ---------------------------------------------------------------------
    // Observações
    // ---------------------------------------------------------------------
    if (dados.observacoes) {
      if (y > LIMITE_RODAPE - 60) {
        doc.addPage();
        y = MARGEM;
      }
      doc.font('Helvetica-Bold').fontSize(8).fillColor(COR.suave);
      doc.text('OBSERVAÇÕES', esquerda, y);
      doc.font('Helvetica').fontSize(9).fillColor(COR.texto);
      doc.text(dados.observacoes, esquerda, y + 13, { width: LARGURA_UTIL });
    }

    // ---------------------------------------------------------------------
    // Rodapé com paginação, em todas as páginas
    // ---------------------------------------------------------------------
    const faixa = doc.bufferedPageRange();
    for (let i = 0; i < faixa.count; i += 1) {
      doc.switchToPage(faixa.start + i);
      const yRodape = 792 - MARGEM + 8;
      doc
        .moveTo(esquerda, yRodape - 10)
        .lineTo(direita, yRodape - 10)
        .strokeColor(COR.borda)
        .lineWidth(0.5)
        .stroke();
      doc.font('Helvetica').fontSize(7.5).fillColor(COR.suave);
      doc.text(dados.empresaRazaoSocial, esquerda, yRodape, { width: LARGURA_UTIL / 2 });
      doc.text(`Página ${i + 1} de ${faixa.count}`, esquerda, yRodape, {
        width: LARGURA_UTIL,
        align: 'right',
      });
    }

    doc.end();
  });
}
