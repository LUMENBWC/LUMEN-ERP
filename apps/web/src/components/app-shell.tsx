'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MenuIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogoutButton } from '@/app/(dashboard)/logout-button';

export interface NavItem {
  href: string;
  label: string;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export interface ShellUser {
  nome: string;
  papel: string;
}

function initials(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (!first) return '?';
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const last = parts[parts.length - 1] ?? first;
  return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase();
}

/* Um link está ativo quando a rota atual é a href ou uma subrota dela. */
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/');
}

/* Título da tela para o breadcrumb — casa a rota mais específica do menu. */
function screenTitle(pathname: string, groups: NavGroup[]): string {
  const all = groups.flatMap((g) => g.items);
  const match = all
    .filter((i) => isActive(pathname, i.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? 'Painel';
}

export function AppShell({
  user,
  nav,
  children,
}: {
  user: ShellUser;
  nav: NavGroup[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Fecha o drawer ao trocar de rota (mobile).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const title = screenTitle(pathname, nav);

  return (
    <div className="flex min-h-screen">
      {/* Backdrop do drawer mobile */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn('fixed inset-0 z-30 bg-black/40 lg:hidden', open ? 'block' : 'hidden')}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-sidebar text-sidebar-foreground border-sidebar-border fixed inset-y-0 left-0 z-40 flex w-[236px] flex-none flex-col border-r transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0 shadow-lg' : '-translate-x-full',
        )}
      >
        <div className="border-sidebar-border font-heading border-b px-5 py-[18px] text-lg font-semibold">
          LUMEN ERP
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-auto px-2.5 py-3">
          {nav.map((group, gi) => (
            <div key={group.label ?? `g${gi}`} className="flex flex-col gap-0.5">
              {group.label && (
                <div className="text-muted-foreground px-2.5 pt-3.5 pb-1 text-[10px] font-medium tracking-[0.09em] uppercase">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-2.5 py-1.5 text-sm transition-colors',
                      active
                        ? 'bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-foreground font-medium'
                        : 'text-muted-foreground hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] hover:text-foreground',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="border-sidebar-border flex flex-col gap-2 border-t px-4 py-3.5">
          <div className="flex items-center gap-2">
            <div className="bg-brand-soft text-info-foreground flex size-7 flex-none items-center justify-center text-xs font-semibold">
              {initials(user.nome)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium">{user.nome}</div>
              <div className="text-muted-foreground truncate text-[11px]">{user.papel}</div>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Coluna principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border flex h-14 flex-none items-center gap-4 border-b px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            className="border-border text-foreground flex size-8 items-center justify-center border lg:hidden"
          >
            <MenuIcon className="size-4" />
          </button>
          <div className="text-muted-foreground text-sm">
            LUMEN ERP / <span className="text-foreground">{title}</span>
          </div>
          <div className="flex-1" />
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto p-6 lg:px-8 lg:py-7">{children}</main>
      </div>
    </div>
  );
}
