export interface PdfStoragePort {
  salvar(caminho: string, buffer: Buffer): Promise<void>;
  obterUrlAssinada(caminho: string, expiresInSeconds: number): Promise<string>;
}

export const PDF_STORAGE_PORT = Symbol('PDF_STORAGE_PORT');
