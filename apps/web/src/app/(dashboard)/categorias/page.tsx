import { AcessoNegado } from '@/components/acesso-negado';
import { CategoriasList } from '@/features/categorias/components/categorias-list';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function CategoriasPage() {
  if (!(await temPermissao('produtos.ler'))) {
    return <AcessoNegado />;
  }

  return <CategoriasList />;
}
