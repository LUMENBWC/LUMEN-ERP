/**
 * Símbolo da marca LUMEN — duas lâminas com simetria de 180°.
 * Usa `currentColor`, então herda a cor do texto do contexto (ouro no badge,
 * branco sobre navy, etc.). Escala sem perda por ser vetor.
 */
export function LumenMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <polygon points="42.8,16.6 43.8,48.1 49.7,54.1 26.9,73.8 25.9,35.0" />
      <polygon points="57.2,83.4 56.2,51.9 50.3,45.9 73.1,26.2 74.1,65.0" />
    </svg>
  );
}
