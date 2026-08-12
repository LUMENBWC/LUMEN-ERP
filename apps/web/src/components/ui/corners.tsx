/*
 * Corners — marcas de registro do frame "blueprint" (design-system Industry).
 * Renderiza os quatro cantos. O elemento pai precisa da classe `blueprint`
 * e de `position: relative` (a classe `blueprint` já garante o relative).
 */
export function Corners() {
  return (
    <>
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
    </>
  );
}
