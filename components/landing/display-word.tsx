/**
 * Le parole a tutta larghezza dei layout (COMBATTI, IMMAGINA), in filigrana in
 * fondo alla loro sezione: da bordo a bordo a qualsiasi larghezza dello
 * schermo, appoggiate sul bordo inferiore.
 *
 * Il contenitore è un container query (`@container`), e la dimensione del font
 * è la sua larghezza divisa per quella dell'inchiostro della parola in em —
 * `100cqw / fit`. Si allinea l'inchiostro, non la scatola del testo: la prima
 * lettera ha una spalla a sinistra (`bearing`, diversa per C e I) e col
 * tracking negativo l'ultima esce dalla scatola, quindi il testo si sposta di
 * `bearing` e l'inchiostro va esattamente da un bordo all'altro.
 *
 * In verticale, `leading-[0.76]` stringe la riga sull'inchiostro. Con le
 * metriche di Sprat (ascendente 1.02em, discendente 0.33em) la riga parte
 * dall'altezza delle maiuscole (0.725em sopra la linea di base) e finisce
 * appena sotto la linea di base: il margine sopra si misura dalla cima delle
 * lettere, e in fondo alla sezione la parola ci poggia sopra.
 *
 * Le misure vengono da `measureText()` su canvas col font caricato (Sprat
 * Condensed Thin, tracking −0.06em, come nei layout): se cambia il font, il
 * tracking o la parola, vanno rifatte, altrimenti la parola sborda o non
 * arriva ai bordi.
 */
const WORDS = {
  COMBATTI: { fit: 4.061, bearing: "-0.078em" },
  IMMAGINA: { fit: 4.135, bearing: "-0.044em" },
} as const;

export function DisplayWord({
  word,
  className = "",
}: {
  word: keyof typeof WORDS;
  className?: string;
}) {
  const { fit, bearing } = WORDS[word];

  return (
    // Decorativa: la parola è un fregio, non un titolo da leggere.
    <div
      aria-hidden="true"
      className={`@container w-full overflow-hidden select-none ${className}`}
    >
      <p
        className="font-display leading-[0.76] tracking-[-0.06em] whitespace-nowrap"
        style={{ fontSize: `calc(100cqw / ${fit})`, marginLeft: bearing }}
      >
        {word}
      </p>
    </div>
  );
}
