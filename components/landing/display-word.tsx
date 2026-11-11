/**
 * Le parole a tutta larghezza dei layout (ESPLORA, IMMAGINA): da bordo a
 * bordo a qualsiasi larghezza dello schermo.
 *
 * Il contenitore è un container query (`@container`), e la dimensione del
 * font è la sua larghezza divisa per quella della parola misurata in em —
 * `100cqw / fit`. Le misure vengono dal browser col font caricato (Sprat
 * Condensed Thin, tracking −0.06em, come nei layout): se cambia il font, il
 * tracking o la parola, vanno rimisurate, altrimenti la parola sborda o non
 * arriva ai bordi.
 *
 * Si allinea l'inchiostro, non la scatola del testo. Col tracking negativo
 * l'ultima lettera esce di ~0.03em dalla scatola (e verrebbe tagliata
 * dall'`overflow-hidden`), mentre la prima ha ~0.044em di spalla a sinistra:
 * per questo il testo è allineato a sinistra e spostato di `SIDE_BEARING`.
 */
export const FIT = {
  ESPLORA: 3.717,
  IMMAGINA: 4.152,
} as const;

// Spalla sinistra di E e I, le iniziali delle due parole.
const SIDE_BEARING = "-0.044em";

export function DisplayWord({
  word,
  className = "",
}: {
  word: keyof typeof FIT;
  className?: string;
}) {
  return (
    <div className={`@container w-full overflow-hidden ${className}`}>
      <p
        className="font-display leading-[0.8] tracking-[-0.06em] whitespace-nowrap"
        style={{
          fontSize: `calc(100cqw / ${FIT[word]})`,
          marginLeft: SIDE_BEARING,
        }}
      >
        {word}
      </p>
    </div>
  );
}
