import type { ComponentProps } from "react";
import styles from "./ticket-pill.module.css";

/**
 * Quanto escono i pallini oltre la forma, per lato, nelle unità del disegno
 * (alto 40): in `Group 248.svg` il bottone è largo 197 e la tavola 208.
 */
const PAD = 5.65;

/** Le misure di Figma: «Medium» 40px e «Small» 32px. */
const HEIGHTS = { m: 40, s: 32 } as const;
type Size = keyof typeof HEIGHTS;

/** Quanto sporgono i pallini a sinistra del bordo del bottone, in px. */
export function pillOverhang(size: Size) {
  return (PAD * HEIGHTS[size]) / 40;
}

/**
 * La forma del bottone (`Subtract.svg`, alta 40) larga `w`: le due estremità
 * tonde con la tacca restano quelle del disegno, si allunga solo il tratto
 * dritto in mezzo. Scalarla tutta deformerebbe le tacche.
 */
function shape(w: number) {
  const x = (n: number) => +(w - n).toFixed(3);
  return (
    `M${x(18.346)} 0C${x(10.134)} 0 ${x(3.08)} 4.95 ${w} 12.028` +
    `C${x(4.112)} 12.361 ${x(7.346)} 15.802 ${x(7.346)} 20` +
    `C${x(7.346)} 24.198 ${x(4.112)} 27.638 ${w} 27.971` +
    `C${x(3.079)} 35.05 ${x(10.134)} 40 ${x(18.346)} 40` +
    "H18.348C10.135 40 3.08 35.05 0 27.971C4.113 27.639 7.348 24.199 7.348 20" +
    "C7.348 15.801 4.113 12.36 0 12.028C3.08 4.95 10.136 0 18.348 0Z"
  );
}

/**
 * Il bottone a biglietto tondo del design system per la UI scura, come link
 * (bianco, pallini bianchi al passaggio, oro al clic: vedi
 * `ticket-pill.module.css`). `width` è la larghezza della forma nelle unità
 * del disegno (alto 40); con `size="s"` tutto scala a 32px. Il link è più
 * largo della forma di `pillOverhang` per lato: lo spazio in cui escono i
 * pallini.
 */
export function TicketPill({
  width = 156,
  size = "m",
  className = "",
  children,
  ...link
}: ComponentProps<"a"> & { width?: number; size?: Size }) {
  const d = shape(width);
  const scale = HEIGHTS[size] / 40;

  return (
    <a
      {...link}
      className={`${styles.pill} ${styles[size]} ${className}`}
      style={{ width: (width + 2 * PAD) * scale }}
    >
      <svg
        aria-hidden="true"
        viewBox={`${-PAD} 0 ${width + 2 * PAD} 40`}
        className={styles.shape}
      >
        {/* Come in `Group 248.svg`: al centro delle tacche, raggio 5. */}
        <circle className={`${styles.dot} ${styles.left}`} cx={-0.646} cy={20} r={5} />
        <circle className={`${styles.dot} ${styles.right}`} cx={width + 0.646} cy={20} r={5} />
        <path d={d} className={styles.body} />
      </svg>
      <span className={styles.label}>{children}</span>
    </a>
  );
}
