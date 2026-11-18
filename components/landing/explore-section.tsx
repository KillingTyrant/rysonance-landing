"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { PHONE } from "./breakpoints";
import { pageTop } from "./page-top";
import { WRAP } from "./wrap";

/**
 * Le quattro voci della sezione. Ogni voce ha la sua carta a destra: per ora
 * una carta disegnata (il titolo sul fondo sfumato), al posto delle immagini
 * che arriveranno. Le carte sono `aria-hidden` perché ripetono i
 * titoli della lista; con le immagini vere servirà un `alt`.
 */
const ITEMS = [
  {
    title: "L’immaginazione incontra il digitale",
    tint: "bg-[radial-gradient(130%_100%_at_100%_0%,#2f5a3e_0%,#1a2a22_50%,#1e2029_100%)]",
  },
  {
    title: "Un mondo condiviso tra tutti i party",
    tint: "bg-[radial-gradient(130%_100%_at_100%_0%,#6a4c12_0%,#2c2416_50%,#1e2029_100%)]",
  },
  {
    title: "Un sistema di gioco unico",
    tint: "bg-[radial-gradient(130%_100%_at_100%_0%,#34466b_0%,#1f2536_50%,#1e2029_100%)]",
  },
  {
    title: "Esperienza multipiattaforma",
    tint: "bg-[radial-gradient(130%_100%_at_100%_0%,#6b1a2c_0%,#2a1219_50%,#1e2029_100%)]",
  },
] as const;

/** Quanto si scorre per ogni voce, in altezze di schermo (come nella demo GSAP). */
const STEP = 0.5;

const subscribePhone = (onChange: () => void) => {
  const query = window.matchMedia(PHONE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
// Sul server il telefono non si conosce: si disegna come se non lo fosse. Il
// primo disegno è comunque lo stesso (prima voce accesa), e l'impaginazione la
// fanno le classi `md:`, non questo valore.
const usePhone = () =>
  useSyncExternalStore(
    subscribePhone,
    () => window.matchMedia(PHONE).matches,
    () => false,
  );

/**
 * «Esplora la nuova generazione», sul modello della demo GSAP «lateral pin
 * indicator»: la sezione resta ferma mentre si scorre, la linea oro a sinistra
 * della lista si allunga, la voce corrente si accende e la carta a destra
 * cambia in dissolvenza. Finite le voci, la sezione riparte con la pagina.
 *
 * Niente GSAP: il blocco è `position: sticky` dentro una sezione alta 100svh
 * più mezzo schermo per voce, e l'avanzamento è la frazione di quell'altezza
 * già scorsa. Basta un ascoltatore di scroll, raggruppato per frame: la linea
 * si aggiorna direttamente sul DOM (un `transform`, niente render), lo stato
 * React cambia solo quando cambia la voce.
 *
 * Tre misure:
 * - telefono (`PHONE`): nessun blocco, la sezione scorre come le altre: il
 *   titolo, le quattro carte una sotto l'altra (ognuna col suo titolo) e il
 *   form. La lista con la linea oro lì non c'è: serve solo all'avanzamento,
 *   e ripeterebbe i titoli delle carte;
 * - tablet (`md`): blocco fermo e impaginazione orizzontale come su desktop,
 *   in due colonne uguali (lista e carta vicine), con le voci che possono
 *   andare a capo;
 * - desktop (`lg`): la colonna di sinistra è di 32rem, quanto basta alla voce
 *   più lunga per stare su una riga anche accesa (Medium è più largo di
 *   Light); la carta prende quello che resta della colonna del sito.
 *
 * Senza JavaScript resta accesa la prima voce. Con movimento ridotto il blocco
 * resta (lo scroll lo fa chi legge), ma voci e carte cambiano senza
 * dissolvenza.
 *
 * `form` è il form della wishlist, come nelle altre sezioni: arriva già
 * disegnato dalla pagina, perché è un Server Component (invio e consenso
 * passano dalla Server Action) e questo componente gira nel browser.
 *
 * `backdrop`, da tablet: lo sfondo del blocco fermo, la parte alta del Void
 * Monster che poi continua sotto la sezione (vedi `app/page.tsx`), scurito
 * dietro al testo col blu notte #020817. Sul telefono, dove la sezione scorre,
 * il fondo è lo stesso blu e il mostro comincia dopo, sfumando da quel colore.
 */
export function ExploreSection({
  form,
  backdrop,
}: {
  form: ReactNode;
  backdrop?: ReactNode;
}) {
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const phone = usePhone();
  const count = ITEMS.length;
  // Sul telefono la sezione non è ferma: niente avanzamento, prima voce.
  const shown = phone ? 0 : active;

  useEffect(() => {
    const el = section.current;
    const pinned = frame.current;
    const bar = fill.current;
    if (phone || !el || !pinned || !bar) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      // Lo spazio in cui il blocco resta fermo: la sezione meno lo schermo.
      const distance = el.offsetHeight - pinned.offsetHeight;
      // Dalla posizione nella pagina e non da getBoundingClientRect: quando
      // la sezione dopo le scorre sopra, questa si rimpicciolisce (vedi
      // `slide-stack.tsx`) e le voci non devono tornare indietro.
      const scrolled = window.scrollY - pageTop(el);
      const progress =
        distance > 0 ? Math.min(1, Math.max(0, scrolled / distance)) : 0;
      // Come nella demo: la linea parte già sulla prima voce (1/n) e arriva
      // in fondo alla lista quando finisce la sezione.
      bar.style.transform = `scaleY(${1 / count + progress * (1 - 1 / count)})`;
      setActive(Math.min(count - 1, Math.floor(progress * count)));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      // Se si passa al telefono, la linea torna sulla prima voce.
      bar.style.transform = `scaleY(${1 / count})`;
    };
  }, [count, phone]);

  return (
    <section
      ref={section}
      aria-labelledby="esplora-titolo"
      className="relative bg-[#020817] text-white md:h-(--explore-h)"
      style={{ "--explore-h": `${100 + count * STEP * 100}svh` } as CSSProperties}
    >
      {/*
        * Da tablet il blocco è alto uno schermo e fermo; `pt-16` lo centra
        * sotto la barra fissa in alto. Sul telefono è un blocco normale.
        */}
      <div
        ref={frame}
        className="relative pt-16 pb-16 md:sticky md:top-0 md:flex md:h-svh md:items-center md:pt-16 md:pb-0"
      >
        {backdrop && (
          <div aria-hidden="true" className="absolute inset-0 hidden overflow-hidden md:block">
            {backdrop}
            {/*
              * Scurisce il mostro dietro al testo, nel blu notte #020817:
              * quasi pieno fin sotto il centro, dove sta il contenuto, poi si
              * spegne. Al fondo del blocco è trasparente: lì il mostro continua
              * nella sezione, e uno scalino di luce si vedrebbe.
              */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(2_8_23/0.88)_0%,rgb(2_8_23/0.84)_65%,rgb(2_8_23/0.62)_85%,transparent_100%)]" />
          </div>
        )}
        {/*
          * Telefono: titolo, carte, form, uno sotto l'altro, nella colonna
          * stretta delle altre sezioni. Da tablet: titolo, lista e form a
          * sinistra, centrati in verticale fra due righe elastiche; la carta
          * della voce accesa a destra occupa tutte le righe.
          */}
        <div
          className={`${WRAP} relative grid gap-y-6 max-md:max-w-[30.5rem] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:grid-rows-[1fr_auto_auto_auto_1fr] md:gap-x-10 md:gap-y-0 lg:grid-cols-[32rem_1fr] lg:gap-x-12`}
        >
          <h2
            id="esplora-titolo"
            className="max-w-[13em] text-[31px] leading-[0.97] font-extrabold md:col-start-1 md:row-start-2 md:text-[2rem] md:leading-[0.9] lg:text-[2.25rem] lg:leading-[0.82]"
          >
            Esplora la nuova generazione dei GDR da tavolo
          </h2>

          {/*
            * Telefono: le carte una sotto l'altra, a tutta larghezza e
            * orizzontali (837/800, la proporzione scelta per la carta su
            * mobile). Qui sono il contenuto, non un doppione della lista, quindi
            * i lettori di schermo le leggono.
            */}
          <ul className="grid gap-5 md:hidden">
            {ITEMS.map((item) => (
              <li
                key={item.title}
                className={`relative aspect-[837/800] overflow-hidden rounded-2xl border border-white/10 ${item.tint}`}
              >
                <span className="absolute inset-x-5 bottom-5 text-lg leading-tight font-extrabold">
                  {item.title}
                </span>
              </li>
            ))}
          </ul>

          {/*
            * Da tablet una carta sola, quella della voce accesa, che cambia in
            * dissolvenza. Tablet: le due colonne sono uguali, e la carta è
            * larga quanto la sua, verticale (25/32), non più alta dello
            * schermo meno la barra. Desktop: alta 32rem e larga quanto la
            * colonna che le resta accanto alla lista.
            */}
          <div className="relative hidden md:col-start-2 md:row-span-full md:block md:aspect-[25/32] md:max-h-[calc(100svh_-_8rem)] md:w-full md:self-center lg:aspect-auto lg:h-[min(32rem,calc(100svh_-_8rem))]">
            {ITEMS.map((item, i) => (
              <div
                key={item.title}
                aria-hidden="true"
                className={`absolute inset-0 overflow-hidden rounded-xl border border-white/10 transition-opacity duration-300 motion-reduce:transition-none ${item.tint} ${
                  i === shown ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="absolute inset-x-5 bottom-5 text-lg leading-tight font-extrabold lg:inset-x-6 lg:bottom-6 lg:text-xl">
                  {item.title}
                </span>
              </div>
            ))}
          </div>

          <div className="relative ml-3 hidden md:col-start-1 md:row-start-3 md:mt-6 md:block">
            {/*
              * La linea va dalla prima all'ultima riga di testo (rientra
              * quanto il padding delle voci) e si allunga dall'alto. Lo stile
              * iniziale lo scrive React una volta sola; poi è lo scroll a
              * aggiornarlo, e React non lo tocca più perché non cambia.
              */}
            <span
              aria-hidden="true"
              className="absolute inset-y-2 left-0 w-1 lg:inset-y-[0.7rem]"
            >
              <span
                ref={fill}
                className="block h-full origin-top rounded-full bg-gold"
                style={{ transform: `scaleY(${1 / count})` }}
              />
            </span>
            <ol className="pl-6">
              {ITEMS.map((item, i) => (
                <li
                  key={item.title}
                  aria-current={i === shown ? "step" : undefined}
                  // La voce accesa diventa oro e passa da Light a Medium: il
                  // Cabinet Grotesk è variabile, quindi anche il peso si anima.
                  className={`py-2 text-2xl leading-[1.2] transition-[color,font-weight] duration-300 ease-out motion-reduce:transition-none lg:py-[0.7rem] lg:text-[1.875rem] ${
                    i === shown ? "font-medium text-gold" : "font-light text-white"
                  }`}
                >
                  {item.title}
                </li>
              ))}
            </ol>
          </div>

          {/* Come il form dell'intestazione: largo quanto lui, a sinistra da tablet. */}
          <div className="mx-auto mt-4 w-full max-w-md md:col-start-1 md:row-start-4 md:mx-0 md:mt-10 md:max-w-[22rem] lg:mt-14">
            {form}
          </div>
        </div>
      </div>
    </section>
  );
}
