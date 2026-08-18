import { useEffect, useState } from 'react';

/**
 * Retorna uma versão "atrasada" do valor: só muda depois de `delayMs` sem
 * novas alterações. Usado para busca — o input continua respondendo a cada
 * tecla, mas a requisição à API dispara apenas quando o usuário pausa,
 * evitando uma chamada por caractere digitado.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
