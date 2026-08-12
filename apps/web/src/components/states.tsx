import * as React from 'react';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

/*
 * Estados de tela padronizados (design-system Industry).
 * Mantêm a interface "bonita mesmo sem dados": vazio, erro, carregando.
 */

function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('items-center gap-3 px-8 py-12 text-center', className)}>
      <div className="font-heading text-lg font-semibold">{title}</div>
      {description && <p className="text-muted-foreground max-w-sm text-sm">{description}</p>}
      {action}
    </Card>
  );
}

function ErrorState({
  message = 'Não foi possível carregar os dados.',
  className,
}: {
  message?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'border-destructive/60 bg-[color-mix(in_srgb,var(--destructive)_8%,transparent)] text-destructive-foreground border px-4 py-3 text-sm font-medium',
        className,
      )}
    >
      {message}
    </div>
  );
}

function LoadingState({
  label = 'Carregando…',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return <p className={cn('text-muted-foreground animate-pulse text-sm', className)}>{label}</p>;
}

/* Skeleton — bloco de carregamento genérico. */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-[color-mix(in_srgb,var(--foreground)_9%,transparent)] animate-pulse',
        className,
      )}
      {...props}
    />
  );
}

export { EmptyState, ErrorState, LoadingState, Skeleton };
