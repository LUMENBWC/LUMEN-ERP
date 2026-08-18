import { DashboardFinanceiro } from '@/features/dashboard/components/dashboard-financeiro';
import { PageHeader } from '@/components/page-header';
import { Card, CardKicker } from '@/components/ui/card';
import { ErrorState } from '@/components/states';
import { getMe } from '@/lib/api/me.server';

export default async function DashboardPage() {
  const me = await getMe();

  if (!me) {
    return <ErrorState message="Não foi possível carregar seus dados." />;
  }

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
