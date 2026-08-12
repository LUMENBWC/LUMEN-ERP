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
    <nav className="border-border flex flex-wrap gap-5 border-b">
      {LINKS.map((link) => {
        const ativo = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              '-mb-px border-b-2 pb-2 text-sm transition-colors',
              ativo
                ? 'border-primary text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
