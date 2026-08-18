import { cache } from 'react';
import { apiFetch } from './server';

export interface Me {
  nome: string;
  email: string;
  empresaId: string;
  papeis: string[];
  permissoes: string[];
}

/**
 * Busca o perfil do usuário logado na API (Server Components/Actions).
 *
 * Envolto em `cache()` do React: durante um mesmo render no servidor, o
 * layout, a página e os guards de permissão chamam `getMe()` várias vezes,
 * mas a requisição HTTP ao NestJS acontece **uma única vez** por render.
 * (O `apiFetch` usa `cache: 'no-store'`, então o dedup nativo do fetch do
 * Next não se aplica — por isso o `cache()` aqui.)
 */
export const getMe = cache(async (): Promise<Me | null> => {
  const res = await apiFetch('/me');
  if (!res.ok) return null;
  return (await res.json()) as Me;
});
