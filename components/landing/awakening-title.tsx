"use client";

import { Fragment, useEffect, useRef, type CSSProperties, type RefObject } from "react";
import styles from "./awakening-title.module.css";

/** La frase, parola per parola. */
const WORDS = ["Il", "mondo", "ha", "bisogno", "del", "tuo", "risveglio"];

/**
 * Dove va a capo, come indice della parola che apre la riga nuova. Da tablet
 * due righe, divise dove si divide la frase (IL MONDO HA BISOGNO / DEL TUO
 * RISVEGLIO); sul telefono tre righe di larghezza simile (IL MONDO HA /
 * BISOGNO DEL / TUO RISVEGLIO), così la frase è più grande. Le misure del
 * testo stanno in `awakening-title.module.css`.
 */
const BREAKS = { wide: [4], phone: [3, 5] };

/** L'onda sotto il mouse, in em della frase. */
const WAVE = {
  /** Quanto sale la lettera proprio sotto il puntatore. */
  height: 0.16,
  /** Quanto è larga l'onda: oltre ~2,5 volte questo, le lettere stanno ferme. */
  reach: 1.4,
  /**
   * Metà della distanza fra due creste: lontano dal puntatore il coseno porta
   * le lettere un filo sotto la riga, prima di tornare ferme.
   */
  length: 3,
  /** Quanto in fretta le lettere raggiungono la loro posizione, per fotogramma. */
  ease: 0.16,
};

/**
 * Le lettere seguono il puntatore come un'onda: quelle sotto il mouse salgono,
 * le vicine un po' meno, ai lati scendono appena; uscito il mouse tornano al
 * loro posto. Solo con un mouse (non sul telefono) e senza movimento ridotto.
 * Gira solo mentre serve: fermi il mouse e le lettere, niente
 * `requestAnimationFrame`.
 */
function useWave(ref: RefObject<HTMLParagraphElement | null>) {
  useEffect(() => {
    const title = ref.current;
    if (!title) return;
    const canWave = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    if (!canWave.matches) return;

    const letters = [...title.querySelectorAll<HTMLElement>("[data-letter]")];
    const offset = new Float32Array(letters.length);
    let centers: { x: number; y: number }[] = [];
    let pointer: { x: number; y: number } | null = null;
    let frame = 0;

    const tick = () => {
      const em = parseFloat(getComputedStyle(title).fontSize);
      const box = title.getBoundingClientRect();
      let moving = false;
      letters.forEach((letter, i) => {
        let target = 0;
        if (pointer) {
          const dx = (box.left + centers[i].x - pointer.x) / em;
          const dy = (box.top + centers[i].y - pointer.y) / em;
          const near = Math.exp(-(dx * dx + dy * dy * 2) / (WAVE.reach * WAVE.reach));
          target = -WAVE.height * near * Math.cos((dx / WAVE.length) * Math.PI);
        }
        offset[i] += (target - offset[i]) * WAVE.ease;
        if (Math.abs(target - offset[i]) > 0.001) moving = true;
        else offset[i] = target;
        letter.style.translate = offset[i] ? `0 ${offset[i].toFixed(4)}em` : "";
      });
      frame = moving ? requestAnimationFrame(tick) : 0;
    };
    const run = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    // Dove sta ogni lettera rispetto alla frase, senza lo spostamento dell'onda.
    const measure = () => {
      const box = title.getBoundingClientRect();
      const em = parseFloat(getComputedStyle(title).fontSize);
      centers = letters.map((letter, i) => {
        const r = letter.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - box.left,
          y: r.top + r.height / 2 - box.top - offset[i] * em,
        };
      });
    };

    const enter = (event: PointerEvent) => {
      measure();
      pointer = { x: event.clientX, y: event.clientY };
      run();
    };
    const move = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      run();
    };
    const leave = () => {
      pointer = null;
      run();
    };

    title.addEventListener("pointerenter", enter);
    title.addEventListener("pointermove", move);
    title.addEventListener("pointerleave", leave);
    return () => {
      title.removeEventListener("pointerenter", enter);
      title.removeEventListener("pointermove", move);
      title.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(frame);
    };
  }, [ref]);
}

/**
 * La frase sul Void Monster, fra «Esplora» e gli Eco: in Sprat maiuscolo come
 * le parole a tutta larghezza, in bianco sul mostro.
 * Compare in dissolvenza mentre si scorre, una parola dopo l'altra, e col
 * mouse le lettere fanno l'onda (vedi `awakening-title.module.css` e
 * `useWave`). Chi usa un lettore di schermo legge la frase intera (lo `span`
 * nascosto): le lettere una per una sono solo disegno.
 *
 * Le maiuscole sono scritte e non `text-transform`: Chrome, con le lettere
 * spostate dall'onda, a volte le disegnava minuscole.
 *
 * Va messa dentro un container query (`@container`) largo quanto la pagina:
 * la misura del testo segue la sua larghezza.
 */
export function AwakeningTitle({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useWave(ref);

  return (
    <p
      ref={ref}
      className={`${styles.title} font-display leading-[0.86] font-light tracking-[-0.03em] text-white ${className}`}
    >
      <span className="sr-only">{WORDS.join(" ")}</span>
      <span aria-hidden="true">
        {WORDS.map((word, i) => (
          <Fragment key={i}>
            {/* Lo spazio c'è sempre: dove la riga va a capo, il browser lo toglie. */}
            {i > 0 && " "}
            {BREAKS.wide.includes(i) && <br className={styles.wide} />}
            {BREAKS.phone.includes(i) && <br className={styles.phone} />}
            <span
              className={styles.word}
              // L'ordine della parola nella frase: le prime compaiono prima.
              style={{ "--i": i } as CSSProperties}
            >
              {[...word.toLocaleUpperCase("it")].map((letter, k) => (
                <span key={k} data-letter="" className={styles.letter}>
                  {letter}
                </span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </p>
  );
}
