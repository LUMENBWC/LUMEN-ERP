'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/financeiro/contas-receber', label: 'Contas a Receber' },
  { href: '/financeiro/contas-pagar', label: 'Contas a Pagar' },
  { href: '/financeiro/clientes-inadimplentes', label: 'Clientes Inadimplentes' },
  { href: '/financeiro/categorias-despesa', label: 'Categorias de Despesa' },
];

export function FinanceiroNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4 border-b pb-2">
      {LINKS.map((link) => {
        const ativo = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'text-sm',
              ativo ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
