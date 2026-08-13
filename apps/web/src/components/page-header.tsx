import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/lib/utils';

/*
 * PageHeader — cabeçalho padrão de tela: título (font-heading) + ação à direita.
 * Uso: <PageHeader title="Produtos" action={<Button>Novo</Button>} />
 *
 * `backHref` renderiza o botão de voltar à esquerda do título. Toda tela de
 * detalhe ou de criação deve informá-lo apontando para a listagem de origem -
 * sem isso o usuário só sai pelo botão do navegador ou abrindo outra aba.
 * É um `Link` (não `router.back()`) de propósito: o destino fica previsível
 * mesmo quando a tela foi aberta direto pela URL ou em nova aba, caso em que
 * o histórico não tem para onde voltar.
 */
function PageHeader({
  title,
  description,
  action,
  backHref,
  backLabel = 'Voltar',
  className,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn('mb-4 flex flex-wrap items-center justify-between gap-3', className)}>
      <div className="flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            aria-label={backLabel}
            title={backLabel}
            className="border-border text-muted-foreground hover:bg-accent hover:text-foreground flex size-8 flex-none items-center justify-center border transition-colors"
          >
            <ArrowLeftIcon className="size-4" />
          </Link>
        )}
        <h1 className="font-heading text-[28px] leading-none font-semibold">{title}</h1>
        {children}
      </div>
      {description && <p className="text-muted-foreground w-full text-sm">{description}</p>}
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

export { PageHeader };
