import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/*
 * Tag — rótulo de status "blueprint" com cores semânticas do design-system.
 * Substitui/estende o Badge para os estados do ERP (sucesso, alerta, erro, info).
 */
const tagVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-[3px] text-[11px] leading-none tracking-[0.02em] [&>svg]:size-3',
  {
    variants: {
      variant: {
        neutral: 'bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] text-muted-foreground',
        accent: 'bg-brand-soft text-info-foreground',
        info: 'bg-brand-soft text-info-foreground',
        success: 'bg-[color-mix(in_srgb,var(--success)_18%,transparent)] text-success-foreground',
        warning: 'bg-[color-mix(in_srgb,var(--warning)_20%,transparent)] text-warning-foreground',
        error:
          'bg-[color-mix(in_srgb,var(--destructive)_16%,transparent)] text-destructive-foreground',
        outline: 'border border-primary text-primary',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
);

function Tag({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof tagVariants>) {
  return <span data-slot="tag" className={cn(tagVariants({ variant }), className)} {...props} />;
}

export { Tag, tagVariants };
