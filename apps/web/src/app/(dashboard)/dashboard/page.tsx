import { apiFetch } from '@/lib/api/server';

interface Me {
  nome: string;
  email: string;
  empresaId: string;
  papeis: string[];
  permissoes: string[];
}

export default async function DashboardPage() {
  const res = await apiFetch('/me');

  if (!res.ok) {
    return (
      <p className="text-destructive text-sm">
        Não foi possível carregar seus dados (status {res.status}).
      </p>
    );
  }

  const me: Me = await res.json();

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">Olá, {me.nome}</h1>
      <p className="text-muted-foreground text-sm">{me.email}</p>
      <p className="text-sm">Papéis: {me.papeis.join(', ') || '—'}</p>
    </div>
  );
}
