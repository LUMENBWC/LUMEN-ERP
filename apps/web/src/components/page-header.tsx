import * as React from 'react';

import { cn } from '@/lib/utils';

/*
 * PageHeader — cabeçalho padrão de tela: título (font-heading) + ação à direita.
 * Uso: <PageHeader title="Produtos" action={<Button>Novo</Button>} />
 */
function PageHeader({
  title,
  description,
  action,
  className,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn('mb-4 flex flex-wrap items-center justify-between gap-3', className)}>
      <div className="flex items-center gap-3">
        <h1 className="font-heading text-[28px] leading-none font-semibold">{title}</h1>
        {children}
      </div>
      {description && <p className="text-muted-foreground w-full text-sm">{description}</p>}
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

export { PageHeader };
