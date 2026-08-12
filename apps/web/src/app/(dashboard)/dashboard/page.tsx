import { DashboardFinanceiro } from '@/features/dashboard/components/dashboard-financeiro';
import { PageHeader } from '@/components/page-header';
import { Card, CardKicker } from '@/components/ui/card';
import { ErrorState } from '@/components/states';
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
    return <ErrorState message={`Não foi possível carregar seus dados (status ${res.status}).`} />;
  }

  const me: Me = await res.json();
  const podeVerFinanceiro = me.permissoes.includes('financeiro.ler');

  if (podeVerFinanceiro) {
    return <DashboardFinanceiro />;
  }

  return (
    <div>
      <PageHeader title="Dashboard" />
      <Card className="max-w-md">
        <CardKicker>Perfil</CardKicker>
        <div className="text-base font-semibold">Olá, {me.nome}</div>
        <div className="text-muted-foreground text-sm">Papéis: {me.papeis.join(', ') || '—'}</div>
        <p className="mt-2 text-sm opacity-80">
          Este papel não tem acesso ao resumo financeiro. Use a navegação lateral para as telas do
          seu dia a dia.
        </p>
      </Card>
    </div>
  );
}
