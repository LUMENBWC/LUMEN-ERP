import * as React from 'react';

import { cn } from '@/lib/utils';
import { Corners } from '@/components/ui/corners';

/*
 * Card — superfície "blueprint": fundo transparente, borda hairline, canto vivo.
 * Com `blueprint` (padrão) ganha as marcas de registro nos quatro cantos.
 * `elevation` mapeia as sombras sm/md/lg do design.
 */
function Card({
  className,
  blueprint = true,
  elevation,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  blueprint?: boolean;
  elevation?: 'sm' | 'md' | 'lg';
}) {
  return (
    <div
      data-slot="card"
      className={cn(
        'flex flex-col gap-2 border border-border bg-transparent p-3 text-card-foreground',
        blueprint && 'blueprint',
        elevation === 'sm' && 'shadow-sm',
        elevation === 'md' && 'shadow-md',
        elevation === 'lg' && 'shadow-lg',
        className,
      )}
      {...props}
    >
      {blueprint && <Corners />}
      {children}
    </div>
  );
}

function CardKicker({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-kicker"
      className={cn('text-[10px] font-medium tracking-[0.1em] text-primary uppercase', className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('font-heading text-[17px] leading-tight font-semibold', className)}
      {...props}
    />
  );
}

function CardBody({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="card-body"
      className={cn('m-0 flex-1 text-sm opacity-80', className)}
      {...props}
    />
  );
}

function CardValue({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-value"
      className={cn(
        'font-heading text-2xl font-semibold tabular-nums whitespace-nowrap',
        className,
      )}
      {...props}
    />
  );
}

export { Card, CardKicker, CardTitle, CardBody, CardValue };
