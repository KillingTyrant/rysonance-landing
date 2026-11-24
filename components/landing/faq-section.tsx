"use client";

import { Fragment, useId, useState } from "react";
import { FAQS } from "./faqs";
import { NARROW, WRAP } from "./wrap";

/**
 * I paragrafi di una risposta (separati da una riga vuota in `faqs.ts`), ognuno
 * con le sue parole e la posizione della prima nella risposta intera: le
 * parole compaiono una dopo l'altra anche passando da un paragrafo al
 * successivo.
 */
function paragraphsOf(answer: string) {
  let start = 0;
  return answer.split(/\n\s*\n/).map((text) => {
    const words = text.trim().split(/\s+/);
    const paragraph = { words, start };
    start += words.length;
    return paragraph;
  });
}

/** I paragrafi di ogni risposta (le risposte non cambiano: si dividono una volta sola), con quante parole ha in tutto. */
const FAQ_PARAGRAPHS = FAQS.map((faq) => {
  const list = paragraphsOf(faq.answer);
  const last = list[list.length - 1];
  return { list, total: last.start + last.words.length };
});

/**
 * Il ritardo della parola `k` su `n`: la prima parte appena il riquadro ha
 * iniziato ad aprirsi, poi una ogni 30ms, ma tutte entro 700ms anche nelle
 * risposte lunghe.
 */
const delayOf = (k: number, n: number) => 120 + k * Math.min(30, 700 / n);

/**
 * Le domande frequenti, sul modello delle FAQ di Motion UI ma senza librerie:
 * le domande in un unico riquadro, una sola aperta alla volta. Titolo e
 * riquadro stanno nella stessa colonna dell'iscrizione che segue (`WRAP`,
 * `NARROW`), allineati a lei. Aprendo, il riquadro cresce morbido (si anima la riga della griglia
 * da 0fr a 1fr, così l'altezza segue il testo senza misurarlo), il «+» diventa
 * «−» (la barra verticale ruota e si posa su quella orizzontale) e la risposta
 * entra parola per parola, come la frase sul Void Monster («Il mondo ha bisogno…»,
 * `awakening-title`): ogni parola sale di 0,3em mentre compare. Il riquadro
 * ha lo stesso fondo del footer (`bg-coal`), staccato solo dal bordo.
 *
 * Il testo di tutte le risposte è nella pagina anche chiuso, quindi lo leggono
 * motori di ricerca e IA; chiuso è `inert`, fuori dal tab e dai lettori di
 * schermo. Pattern accordion di WAI-ARIA: bottone con `aria-expanded` dentro
 * un titolo, risposta come regione collegata. Con il movimento ridotto si
 * apre e si chiude senza animazioni.
 */
export function FaqSection() {
  // Tutte chiuse all'arrivo: si apre quella che si sceglie.
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();

  return (
    <div className={`${WRAP} ${NARROW} pt-16 lg:pt-40`}>
      <h2
        id="domande"
        className="text-[28px] leading-[0.97] font-extrabold lg:text-[2.25rem] lg:leading-[0.95]"
      >
        Domande frequenti
      </h2>

      <div className="mt-8 overflow-hidden rounded-[1.25rem] border border-white/10 bg-coal lg:mt-10">
        {FAQS.map((faq, i) => {
          const isOpen = open === i;
          const button = `${id}-domanda-${i}`;
          const panel = `${id}-risposta-${i}`;
          return (
            <div key={faq.question} className="border-b border-white/10 last:border-b-0">
              <h3>
                <button
                  id={button}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panel}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full cursor-pointer items-center justify-between gap-6 px-5 py-5 text-left text-[1.125rem] leading-tight font-bold transition-colors hover:bg-white/[0.03] focus-visible:bg-white/[0.05] focus-visible:outline-none lg:px-8 lg:py-6 lg:text-[1.375rem]"
                >
                  <span>{faq.question}</span>
                  <span aria-hidden="true" className="relative size-4 shrink-0 text-white/70">
                    <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-current" />
                    <span
                      className={`absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                        isOpen ? "rotate-90" : "rotate-0"
                      }`}
                    />
                  </span>
                </button>
              </h3>
              <div
                id={panel}
                role="region"
                aria-labelledby={button}
                inert={!isOpen}
                className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="max-w-[40rem] space-y-3 px-5 pb-6 text-[17px] leading-snug text-white/70 lg:space-y-4 lg:px-8 lg:pb-8 lg:text-[1.1875rem]">
                    {FAQ_PARAGRAPHS[i].list.map(({ words, start }, p) => (
                      <p key={p}>
                        {words.map((word, k) => (
                          <Fragment key={k}>
                            {/* Gli spazi fuori dalle parole: lì la riga può andare a capo. */}
                            {k > 0 && " "}
                            <span
                              style={{
                                transitionDelay: isOpen
                                  ? `${delayOf(start + k, FAQ_PARAGRAPHS[i].total)}ms`
                                  : "0ms",
                              }}
                              className={`inline-block transition-[opacity,translate] duration-500 ease-out motion-reduce:transition-none ${
                                isOpen ? "translate-y-0 opacity-100" : "translate-y-[0.3em] opacity-0"
                              }`}
                            >
                              {word}
                            </span>
                          </Fragment>
                        ))}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
