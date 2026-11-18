"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { PHONE } from "./breakpoints";
import { pageTop } from "./page-top";

/** Fin dove si rimpicciolisce la sezione coperta, come nella demo GSAP. */
const SCALE = 0.7;
/** L'opacità a fine rimpicciolimento. */
const DIM = 0.5;
/** La parte dell'avanzamento che rimpicciolisce; nel resto l'opacità va a 0. */
const SHRINK = 0.9;
/** Il raggio degli angoli quando la sezione è tutta rimpicciolita. */
const RADIUS = 24; // px
/**
 * Quanto si scorre con la sezione ferma e intera prima che spunti la
 * successiva: senza, la sezione sotto parte appena si tocca lo scroll e
 * sembra un errore. Vale per le sezioni alte almeno uno schermo (vedi `stack`).
 */
const HOLD = 200; // px

/** Il `power1.out` di GSAP, l'andamento della demo. */
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
const clamp = (t: number) => Math.min(1, Math.max(0, t));

/**
 * Le sezioni della landing come le slide della demo GSAP «Slides Pinning –
 * Overscroll Solution»: quando una sezione finisce resta ferma, e mentre la
 * successiva le scorre sopra si rimpicciolisce verso il centro, si arrotonda e
 * sbiadisce. Le sezioni più alte dello schermo scorrono prima per intero, e il
 * blocco parte quando il loro fondo tocca il fondo dello schermo; quelle più
 * basse si fermano quando arrivano in cima. L'ultima scorre normale.
 *
 * Come «Esplora la nuova generazione», niente GSAP: il blocco è
 * `position: sticky` con `top` = schermo − altezza della sezione (0 per le
 * sezioni basse), e l'avanzamento è quanto la sezione successiva è salita
 * sulla parte visibile. La pausa prima che spunti la successiva (`HOLD`) è un
 * margine sopra la successiva: non si vede mai, perché in quel tratto la
 * sezione ferma copre tutto lo schermo. Le sezioni basse non hanno pausa, perché il
 * margine resterebbe vuoto fra loro e la successiva. Le
 * posizioni si misurano solo quando cambiano le misure; a ogni frame di
 * scroll si legge `scrollY` e si scrivono `transform`, `opacity` e
 * `clip-path`. Il `clip-path` tiene la sola parte che era sullo schermo:
 * rimpicciolendo, una sezione alta mostrerebbe anche il pezzo già passato.
 *
 * Le sezioni sono i figli diretti del `<main>`. Senza JavaScript, con
 * movimento ridotto e sul telefono (`PHONE`) la pagina scorre normale.
 */
export function SlideStack({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const main = root.current;
    if (!main) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const phone = window.matchMedia(PHONE);
    let stop: (() => void) | null = null;
    const sync = () => {
      stop?.();
      stop = motion.matches || phone.matches ? null : stack(main);
    };
    sync();
    motion.addEventListener("change", sync);
    phone.addEventListener("change", sync);
    return () => {
      motion.removeEventListener("change", sync);
      phone.removeEventListener("change", sync);
      stop?.();
    };
  }, []);

  return (
    <main ref={root} className={className}>
      {children}
    </main>
  );
}

/** Mette in pila le sezioni di `main`; restituisce la funzione che le libera. */
function stack(main: HTMLElement) {
  const slides = Array.from(main.children) as HTMLElement[];
  const panels = slides.slice(0, -1);
  const last = slides.at(-1);
  if (!last || panels.length === 0) return () => {};

  // L'altezza dello schermo in px come `100svh`, la stessa del blocco di
  // «Esplora»: su mobile non cambia quando appare o sparisce la barra del
  // browser, quindi le sezioni non saltano.
  const probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText =
    "position:absolute;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none";
  document.body.append(probe);

  let raf = 0;
  let measuring = 0;
  let screen = 0;
  let heights: number[] = [];
  // Quanto di ogni sezione sta sullo schermo quando è ferma.
  let visible: number[] = [];
  let tops: number[] = [];
  let maxScroll = 0;
  // L'ultimo avanzamento scritto per sezione, per non riscrivere lo stile.
  const painted = panels.map(() => -1);

  for (const panel of panels) panel.style.position = "sticky";
  // L'ultima deve passare sopra la penultima, che è posizionata.
  const lastWasStatic = getComputedStyle(last).position === "static";
  if (lastWasStatic) last.style.position = "relative";

  const measure = () => {
    screen = probe.offsetHeight;
    // Le posizioni nel flusso: `sticky` e le trasformazioni non le cambiano.
    heights = slides.map((s) => s.offsetHeight);
    visible = heights.map((h) => Math.min(h, screen));
    const gaps = slides.map((_, i) =>
      i < panels.length && heights[i] >= screen ? HOLD : 0,
    );
    let y = pageTop(main);
    tops = heights.map((h, i) => {
      const top = y;
      y += h + gaps[i];
      return top;
    });
    panels.forEach((panel, i) => {
      const h = heights[i];
      panel.style.top = `${Math.min(0, screen - h)}px`;
      // Sopra la successiva e non sotto questa: il margine di una sezione
      // `sticky` conta come sua, e a fine pagina la spingerebbe in su.
      slides[i + 1].style.marginTop = gaps[i] ? `${gaps[i]}px` : "";
      // Il centro della parte sullo schermo.
      panel.style.transformOrigin = `50% ${h - visible[i] / 2}px`;
    });
    // Dopo i margini, che allungano la pagina.
    maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    painted.fill(-1);
    render();
  };

  const render = () => {
    raf = 0;
    const y = window.scrollY;
    panels.forEach((panel, i) => {
      // Da quando la sezione dopo tocca il fondo della parte visibile a
      // quando arriva in cima; se la pagina finisce prima (l'ultima sezione è
      // bassa), l'effetto si chiude a fine pagina e non resta a metà.
      const start = tops[i + 1] - visible[i];
      const end = Math.min(tops[i + 1], maxScroll);
      let progress = end > start ? clamp((y - start) / (end - start)) : 0;
      // In fondo alla pagina `scrollY` può restare a una frazione di pixel
      // dalla fine: la sezione va comunque nascosta del tutto.
      if (progress > 0.998) progress = 1;
      if (progress === painted[i]) return;
      painted[i] = progress;
      paint(panel, progress, heights[i] - visible[i]);
    });
  };

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(render);
  };
  const remeasure = () => {
    if (!measuring) {
      measuring = requestAnimationFrame(() => {
        measuring = 0;
        measure();
      });
    }
  };

  // Le altezze cambiano coi font, le immagini e l'esito del form.
  const resize = new ResizeObserver(remeasure);
  for (const slide of slides) resize.observe(slide);
  resize.observe(document.body);

  measure();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", remeasure);

  return () => {
    cancelAnimationFrame(raf);
    cancelAnimationFrame(measuring);
    resize.disconnect();
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", remeasure);
    probe.remove();
    for (const panel of panels) {
      panel.style.position = "";
      panel.style.top = "";
      panel.style.transformOrigin = "";
      paint(panel, 0, 0);
    }
    for (const slide of slides) slide.style.marginTop = "";
    if (lastWasStatic) last.style.position = "";
  };
}

/**
 * Lo stato della sezione coperta per `progress` da 0 a 1: fino a `SHRINK` si
 * rimpicciolisce e scende a metà opacità, poi sparisce. `hidden` è quanto
 * della sezione sta sopra lo schermo e va tagliato.
 */
function paint(panel: HTMLElement, progress: number, hidden: number) {
  const s = panel.style;
  if (progress === 0) {
    s.transform = s.opacity = s.clipPath = s.visibility = s.willChange = "";
    return;
  }
  const t = easeOut(Math.min(1, progress / SHRINK));
  s.transform = `scale(${1 - (1 - SCALE) * t})`;
  s.opacity = String(
    progress < SHRINK
      ? 1 - (1 - DIM) * t
      : DIM * (1 - easeOut((progress - SHRINK) / (1 - SHRINK))),
  );
  s.clipPath = `inset(${hidden}px 0 0 round ${RADIUS * t}px)`;
  // Coperta del tutto: fuori anche dal tab e dai lettori di schermo.
  s.visibility = progress >= 1 ? "hidden" : "";
  s.willChange = progress >= 1 ? "" : "transform, opacity";
}
