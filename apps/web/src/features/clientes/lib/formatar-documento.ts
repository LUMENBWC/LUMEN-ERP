/** Aplica a máscara de CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00) e trunca no limite de dígitos do tipo. */
export function formatarDocumento(tipoPessoa: 'FISICA' | 'JURIDICA', valor: string): string {
  const max = tipoPessoa === 'FISICA' ? 11 : 14;
  const digitos = valor.replace(/\D/g, '').slice(0, max);

  if (tipoPessoa === 'FISICA') {
    const partes = [
      digitos.slice(0, 3),
      digitos.slice(3, 6),
      digitos.slice(6, 9),
      digitos.slice(9, 11),
    ];
    let resultado = partes[0] ?? '';
    if (partes[1]) resultado += '.' + partes[1];
    if (partes[2]) resultado += '.' + partes[2];
    if (partes[3]) resultado += '-' + partes[3];
    return resultado;
  }

  const partes = [
    digitos.slice(0, 2),
    digitos.slice(2, 5),
    digitos.slice(5, 8),
    digitos.slice(8, 12),
    digitos.slice(12, 14),
  ];
  let resultado = partes[0] ?? '';
  if (partes[1]) resultado += '.' + partes[1];
  if (partes[2]) resultado += '.' + partes[2];
  if (partes[3]) resultado += '/' + partes[3];
  if (partes[4]) resultado += '-' + partes[4];
  return resultado;
}
