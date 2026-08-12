'use client';

import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';

/*
 * Alterna o tema claro/escuro (design-system Industry suporta ambos).
 * Persiste em localStorage; o script inline no <head> evita flash na carga.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('lumen-theme', next ? 'dark' : 'light');
    } catch {
      // ignora indisponibilidade de storage
    }
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={dark ? 'Tema claro' : 'Tema escuro'}
      className={`text-muted-foreground hover:text-foreground border-border hover:bg-[color-mix(in_srgb,var(--foreground)_7%,transparent)] flex size-8 items-center justify-center border transition-colors ${className ?? ''}`}
    >
      {dark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
    </button>
  );
}
