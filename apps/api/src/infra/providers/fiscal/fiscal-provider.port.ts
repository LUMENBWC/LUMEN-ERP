export type TipoDocumentoFiscal = 'NFE' | 'NFCE' | 'NFSE';

export type StatusDocumentoFiscal = 'AUTORIZADO' | 'REJEITADO' | 'CANCELADO';

export interface ItemDocumentoFiscal {
  produtoId: string;
  descricao: string;
  ncm?: string;
  cfop?: string;
  cst?: string;
  quantidade: number;
  valorUnitario: number;
}

export interface EmitirDocumentoFiscalInput {
  empresaId: string;
  tipo: TipoDocumentoFiscal;
  vendaId: string;
  itens: ItemDocumentoFiscal[];
  destinatario: {
    nome: string;
    documento: string;
  };
  valorTotal: number;
}

export interface DocumentoFiscalEmitido {
  chaveAcesso: string;
  numero: string;
  serie: string;
  status: StatusDocumentoFiscal;
  urlXml?: string;
  urlPdf?: string;
}

/**
 * Porta para emissão de documentos fiscais (NF-e, NFC-e, NFS-e) via provedor externo.
 * Sem implementação concreta no MVP — ver StubFiscalProvider.
 */
export interface FiscalProvider {
  emitir(input: EmitirDocumentoFiscalInput): Promise<DocumentoFiscalEmitido>;
  cancelar(chaveAcesso: string, justificativa: string): Promise<void>;
  consultarStatus(chaveAcesso: string): Promise<StatusDocumentoFiscal>;
}
