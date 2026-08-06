/**
 * Regra pura (spec Secao 3.3: "documento (CPF/CNPJ com validação...)").
 * Verifica os dígitos verificadores conforme o algoritmo oficial da Receita
 * Federal - não apenas o formato/tamanho. Aceita o documento com ou sem
 * máscara (só os dígitos importam para o cálculo).
 */
export function validarDocumento(tipoPessoa: 'FISICA' | 'JURIDICA', documento: string): boolean {
  const digitos = documento.replace(/\D/g, '');
  return tipoPessoa === 'FISICA' ? validarCPF(digitos) : validarCNPJ(digitos);
}

function todosDigitosIguais(digitos: string): boolean {
  return digitos.split('').every((d) => d === digitos[0]);
}

function calcularDigitoVerificador(digitos: string, pesos: number[]): number {
  const soma = digitos
    .split('')
    .reduce((acc, digito, index) => acc + Number(digito) * pesos[index], 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

function validarCPF(digitos: string): boolean {
  if (digitos.length !== 11 || todosDigitosIguais(digitos)) {
    return false;
  }
  const primeiroDigito = calcularDigitoVerificador(
    digitos.slice(0, 9),
    [10, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  const segundoDigito = calcularDigitoVerificador(
    digitos.slice(0, 9) + primeiroDigito,
    [11, 10, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  return digitos === digitos.slice(0, 9) + String(primeiroDigito) + String(segundoDigito);
}

function validarCNPJ(digitos: string): boolean {
  if (digitos.length !== 14 || todosDigitosIguais(digitos)) {
    return false;
  }
  const primeiroDigito = calcularDigitoVerificador(
    digitos.slice(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  const segundoDigito = calcularDigitoVerificador(
    digitos.slice(0, 12) + primeiroDigito,
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  return digitos === digitos.slice(0, 12) + String(primeiroDigito) + String(segundoDigito);
}
