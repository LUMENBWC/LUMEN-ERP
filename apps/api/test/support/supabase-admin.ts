import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: path.resolve(__dirname, '../../../../.env') });

export function hasSupabaseAdminCredentials(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente ${name} não definida.`);
  }
  return value;
}

/** Cliente com a secret key - só para provisionar/remover o usuário de teste do Supabase Auth. */
export function createSupabaseAdminClient() {
  return createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SECRET_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Cliente com a publishable key - usado só para trocar email/senha por um JWT real (signIn). */
export function createSupabasePublishableClient() {
  return createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_PUBLISHABLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
