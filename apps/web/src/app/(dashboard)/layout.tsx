import { redirect } from 'next/navigation';
import { AppShell, type NavGroup } from '@/components/app-shell';
import { apiFetch } from '@/lib/api/server';
import { createClient } from '@/lib/supabase/server';

interface Me {
  nome: string;
  email: string;
  empresaId: string;
  papeis: string[];
  permissoes: string[];
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const meRes = await apiFetch('/me');
  const me: Partial<Me> = meRes.ok ? await meRes.json() : {};
  const permissoes = new Set(me.permissoes ?? []);
  const has = (p: string) => permissoes.has(p);

  // Grupos de navegação — cada item só aparece com a permissão correspondente.
  const groups: NavGroup[] = [
    { items: [{ href: '/dashboard', label: 'Dashboard' }] },
    {
      label: 'Operação',
      items: [
        has('vendas.criar') && { href: '/pdv', label: 'PDV' },
        has('caixa.abrir') && { href: '/caixa', label: 'Caixa' },
        has('vendas.criar') && { href: '/vendas', label: 'Vendas' },
        has('orcamentos.ler') && { href: '/orcamentos', label: 'Orçamentos' },
      ].filter(Boolean) as NavGroup['items'],
    },
    {
      label: 'Cadastros',
      items: [
        has('produtos.ler') && { href: '/produtos', label: 'Produtos' },
        has('produtos.ler') && { href: '/categorias', label: 'Categorias' },
        has('estoque.ler') && { href: '/estoque', label: 'Estoque' },
        has('clientes.ler') && { href: '/clientes', label: 'Clientes' },
        has('fornecedores.ler') && { href: '/fornecedores', label: 'Fornecedores' },
      ].filter(Boolean) as NavGroup['items'],
    },
    {
      label: 'Financeiro',
      items: [
        has('financeiro.ler') && {
          href: '/financeiro/contas-receber',
          label: 'Contas a receber',
        },
        has('financeiro.ler') && { href: '/financeiro/contas-pagar', label: 'Contas a pagar' },
        has('financeiro.ler') && {
          href: '/financeiro/clientes-inadimplentes',
          label: 'Inadimplentes',
        },
        has('financeiro.ler') && {
          href: '/financeiro/categorias-despesa',
          label: 'Categorias de despesa',
        },
      ].filter(Boolean) as NavGroup['items'],
    },
    {
      label: 'Administração',
      items: [has('usuarios.gerenciar') && { href: '/usuarios', label: 'Usuários' }].filter(
        Boolean,
      ) as NavGroup['items'],
    },
  ].filter((g) => g.items.length > 0);

  const papel = (me.papeis ?? []).join(', ') || 'Sem papel';

  return (
    <AppShell user={{ nome: me.nome ?? 'Usuário', papel }} nav={groups}>
      {children}
    </AppShell>
  );
}
