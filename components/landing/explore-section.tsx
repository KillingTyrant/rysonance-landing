"use client";

import { useEffect, useRef, useState } from "react";
import ticket from "@/components/ticket.module.css";
import { NARROW, WRAP } from "./wrap";

/**
 * Le quattro voci della sezione. Ogni voce ha la sua carta a destra: per ora
 * una carta disegnata (il titolo sul fondo sfumato), al posto delle immagini
 * che arriveranno. Le carte sono `aria-hidden` perché ripetono i
 * titoli della lista; con le immagini vere servirà un `alt`.
 */
const ITEMS = [
  {
    title: "Multipiattaforma",
    tint: "bg-[radial-gradient(130%_100%_at_100%_0%,#6b1a2c_0%,#2a1219_50%,#1e2029_100%)]",
  },
  {
    title: "Un mondo di gioco condiviso",
    tint: "bg-[radial-gradient(130%_100%_at_100%_0%,#6a4c12_0%,#2c2416_50%,#1e2029_100%)]",
  },
  {
    title: "Un sistema di gioco unico",
    tint: "bg-[radial-gradient(130%_100%_at_100%_0%,#34466b_0%,#1f2536_50%,#1e2029_100%)]",
  },
  {
    title: "Un’esperienza costruita per il tavolo",
    tint: "bg-[radial-gradient(130%_100%_at_100%_0%,#2f5a3e_0%,#1a2a22_50%,#1e2029_100%)]",
  },
] as const;

/** Quanto si scorre per ogni voce, in altezze di schermo (come nella demo GSAP). */
const STEP = 0.5;

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
 * Senza JavaScript resta accesa la prima voce. Con movimento ridotto il blocco
 * resta (lo scroll lo fa chi legge), ma voci e carte cambiano senza
 * dissolvenza.
 */
export function ExploreSection() {
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const count = ITEMS.length;

  useEffect(() => {
    const el = section.current;
    const pinned = frame.current;
    const bar = fill.current;
    if (!el || !pinned || !bar) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      // Lo spazio in cui il blocco resta fermo: la sezione meno lo schermo.
      const distance = el.offsetHeight - pinned.offsetHeight;
      const scrolled = -el.getBoundingClientRect().top;
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
    };
  }, [count]);

  return (
    <section
      ref={section}
      aria-labelledby="esplora-titolo"
      className="relative bg-ink text-white"
      style={{ height: `${100 + count * STEP * 100}svh` }}
    >
      <div ref={frame} className="sticky top-0 flex h-svh items-center">
        {/*
          * Mobile: titolo, carta, lista, bottone, uno sotto l'altro. Desktop:
          * titolo, lista e bottone a sinistra, centrati in verticale fra due
          * righe elastiche; la carta a destra occupa tutte le righe.
          */}
        <div
          className={`${WRAP} ${NARROW} grid gap-y-6 lg:grid-cols-[1fr_auto] lg:grid-rows-[1fr_auto_auto_auto_1fr] lg:gap-x-12 lg:gap-y-0`}
        >
          <h2
            id="esplora-titolo"
            className="max-w-[13em] text-[31px] leading-[0.97] font-bold lg:col-start-1 lg:row-start-2 lg:text-[2.25rem] lg:leading-[0.82]"
          >
            Esplora la nuova generazione del gioco di ruolo da tavolo
          </h2>

          <div className="relative mx-auto aspect-[27/40] h-[min(18rem,32svh)] lg:col-start-2 lg:row-span-full lg:mx-0 lg:h-[min(32rem,calc(100svh_-_8rem))] lg:self-center lg:justify-self-end">
            {ITEMS.map((item, i) => (
              <div
                key={item.title}
                aria-hidden="true"
                className={`absolute inset-0 overflow-hidden rounded-xl border border-white/10 transition-opacity duration-300 motion-reduce:transition-none ${item.tint} ${
                  i === active ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="absolute inset-x-5 bottom-5 text-base leading-tight font-bold lg:inset-x-6 lg:bottom-6 lg:text-xl">
                  {item.title}
                </span>
              </div>
            ))}
          </div>

          <div className="relative ml-3 lg:col-start-1 lg:row-start-3 lg:mt-6">
            {/*
              * La linea va dalla prima all'ultima riga di testo (rientra
              * quanto il padding delle voci) e si allunga dall'alto. Lo stile
              * iniziale lo scrive React una volta sola; poi è lo scroll a
              * aggiornarlo, e React non lo tocca più perché non cambia.
              */}
            <span
              aria-hidden="true"
              className="absolute inset-y-1.5 left-0 w-1 lg:inset-y-[0.7rem]"
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
                  aria-current={i === active ? "step" : undefined}
                  className={`py-1.5 text-lg leading-[1.2] font-light transition-colors duration-200 motion-reduce:transition-none lg:py-[0.7rem] lg:text-[1.875rem] ${
                    i === active ? "text-gold" : "text-white"
                  }`}
                >
                  {item.title}
                </li>
              ))}
            </ol>
          </div>

          <a
            href="#eco"
            className={`${ticket.ticket} ${ticket.gold} flex h-11 w-full max-w-md items-center justify-center px-8 text-[1.0625rem] font-bold lg:col-start-1 lg:row-start-4 lg:mt-24 lg:w-[22rem]`}
          >
            Scopri di più
          </a>
        </div>
      </div>
    </section>
  );
}
