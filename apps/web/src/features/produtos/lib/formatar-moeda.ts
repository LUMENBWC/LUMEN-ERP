export function formatarMoeda(valor: string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number(valor),
  );
}

export function formatarPercentual(valor: string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1 }).format(
    Number(valor),
  );
}
