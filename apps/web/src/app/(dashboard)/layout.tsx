import Link from 'next/link';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api/server';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from './logout-button';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const meRes = await apiFetch('/me');
  const permissoes: string[] = meRes.ok ? ((await meRes.json()).permissoes ?? []) : [];
  const podeGerenciarUsuarios = permissoes.includes('usuarios.gerenciar');
  const podeVerProdutos = permissoes.includes('produtos.ler');
  const podeVerEstoque = permissoes.includes('estoque.ler');
  const podeVerClientes = permissoes.includes('clientes.ler');
  const podeVerFornecedores = permissoes.includes('fornecedores.ler');
  const podeVerOrcamentos = permissoes.includes('orcamentos.ler');
  const podeVerVendas = permissoes.includes('vendas.criar');
  const podeVerCaixa = permissoes.includes('caixa.abrir');
  const podeVerFinanceiro = permissoes.includes('financeiro.ler');

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="font-semibold">
            ERP SaaS
          </Link>
          {podeVerProdutos && (
            <>
              <Link
                href="/produtos"
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Produtos
              </Link>
              <Link
                href="/categorias"
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Categorias
              </Link>
            </>
          )}
          {podeVerEstoque && (
            <Link href="/estoque" className="text-muted-foreground hover:text-foreground text-sm">
              Estoque
            </Link>
          )}
          {podeVerClientes && (
            <Link href="/clientes" className="text-muted-foreground hover:text-foreground text-sm">
              Clientes
            </Link>
          )}
          {podeVerFornecedores && (
            <Link
              href="/fornecedores"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Fornecedores
            </Link>
          )}
          {podeVerOrcamentos && (
            <Link
              href="/orcamentos"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Orçamentos
            </Link>
          )}
          {podeVerVendas && (
            <>
              <Link href="/pdv" className="text-muted-foreground hover:text-foreground text-sm">
                PDV
              </Link>
              <Link href="/vendas" className="text-muted-foreground hover:text-foreground text-sm">
                Vendas
              </Link>
            </>
          )}
          {podeVerCaixa && (
            <Link href="/caixa" className="text-muted-foreground hover:text-foreground text-sm">
              Caixa
            </Link>
          )}
          {podeVerFinanceiro && (
            <Link
              href="/financeiro/contas-receber"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Financeiro
            </Link>
          )}
          {podeGerenciarUsuarios && (
            <Link href="/usuarios" className="text-muted-foreground hover:text-foreground text-sm">
              Usuários
            </Link>
          )}
        </nav>
        <LogoutButton />
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
