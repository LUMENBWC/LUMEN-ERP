import { AcessoNegado } from '@/components/acesso-negado';
import { CriarUsuarioForm } from '@/features/usuarios/components/criar-usuario-form';
import { temPermissao } from '@/lib/auth/require-permissao.server';

export default async function NovoUsuarioPage() {
  if (!(await temPermissao('usuarios.gerenciar'))) {
    return <AcessoNegado />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Novo usuário</h1>
      <CriarUsuarioForm />
    </div>
  );
}
