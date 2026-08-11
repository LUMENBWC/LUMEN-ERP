function digitoVerificador(digitos: number[]): number {
  let soma = 0;
  for (let i = 0; i < digitos.length; i++) {
    soma += digitos[i] * (digitos.length + 1 - i);
  }
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

/** CPF sintaticamente válido (dígitos verificadores corretos) para uso em fixtures de teste. */
export function gerarCpfValido(): string {
  let base: number[];
  do {
    base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  } while (base.every((digito) => digito === base[0]));

  const d1 = digitoVerificador(base);
  const d2 = digitoVerificador([...base, d1]);
  return [...base, d1, d2].join('');
}
