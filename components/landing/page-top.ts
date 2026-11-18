/**
 * La distanza di un elemento dall'alto della pagina, come somma degli
 * `offsetTop`. A differenza di `getBoundingClientRect` non risente delle
 * trasformazioni: le sezioni della landing si rimpiccioliscono quando la
 * successiva ci scorre sopra (vedi `slide-stack.tsx`), e chi misura lo scroll
 * al loro interno non deve vedersele muovere.
 */
export function pageTop(node: HTMLElement) {
  let top = 0;
  for (let n: HTMLElement | null = node; n; n = n.offsetParent as HTMLElement | null) {
    top += n.offsetTop;
  }
  return top;
}
