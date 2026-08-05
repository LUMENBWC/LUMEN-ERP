import { apiFetch } from '@/lib/api/server';

/**
 * Checa uma permissão no servidor (Server Component) antes de renderizar
 * uma página protegida - complementa o RBAC do backend, não o substitui
 * (o backend sempre valida de novo via `@RequirePermissions`).
 */
export async function temPermissao(chave: string): Promise<boolean> {
  const res = await apiFetch('/me');
  if (!res.ok) return false;
  const me = (await res.json()) as { permissoes?: string[] };
  return (me.permissoes ?? []).includes(chave);
}
