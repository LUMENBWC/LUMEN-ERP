import { getMe } from '@/lib/api/me.server';

/**
 * Checa uma permissão no servidor (Server Component) antes de renderizar
 * uma página protegida - complementa o RBAC do backend, não o substitui
 * (o backend sempre valida de novo via `@RequirePermissions`).
 *
 * Usa `getMe()` cacheado por render: se o layout já buscou o `/me`, esta
 * checagem reutiliza o mesmo resultado sem nova ida à API.
 */
export async function temPermissao(chave: string): Promise<boolean> {
  const me = await getMe();
  return (me?.permissoes ?? []).includes(chave);
}
