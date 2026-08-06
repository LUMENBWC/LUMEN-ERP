import { Injectable } from '@nestjs/common';
import { createAdminClient } from '@supabase/server/core';
import type { PdfStoragePort } from '../application/ports/pdf-storage.port';

const BUCKET = 'orcamentos-pdf';

@Injectable()
export class SupabasePdfStorage implements PdfStoragePort {
  async salvar(caminho: string, buffer: Buffer): Promise<void> {
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(caminho, buffer, { contentType: 'application/pdf', upsert: true });
    if (error) {
      throw new Error(`Falha ao salvar PDF no storage: ${error.message}`);
    }
  }

  async obterUrlAssinada(caminho: string, expiresInSeconds: number): Promise<string> {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(caminho, expiresInSeconds);
    if (error || !data) {
      throw new Error(`Falha ao gerar URL assinada do PDF: ${error?.message}`);
    }
    return data.signedUrl;
  }
}
