export interface Periodo {
  inicio: Date;
  fim: Date;
}

const DIAS_PADRAO = 30;

/**
 * Sem período informado, o dashboard mostra os últimos 30 dias até hoje -
 * evita forçar o usuário a escolher datas só pra ver o resumo padrão.
 */
export function resolverPeriodo(
  dataInicio: Date | undefined,
  dataFim: Date | undefined,
  hoje: Date,
): Periodo {
  const fim = dataFim ?? hoje;
  const inicio = dataInicio ?? new Date(fim.getTime() - DIAS_PADRAO * 24 * 60 * 60 * 1000);
  return { inicio, fim };
}
