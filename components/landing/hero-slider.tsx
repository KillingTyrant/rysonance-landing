"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import elfi from "@/assets/landing/elfi.jpg";
import gataAri from "@/assets/landing/gata-ari.jpg";
import nani from "@/assets/landing/nani.jpg";
import orchi from "@/assets/landing/orchi.jpg";
import uluAri from "@/assets/landing/ulu-ari.jpg";
import umani from "@/assets/landing/umani.jpg";
import styles from "./hero-slider.module.css";

/**
 * I popoli di Rysonance, uno per illustrazione. Le sei tavole hanno la stessa
 * misura e la stessa composizione (teschio al centro, emblema in alto), per
 * questo si passa dall'una all'altra in dissolvenza e non scorrendo: il
 * teschio resta fermo e cambia popolo.
 */
const SLIDES: { name: string; image: StaticImageData; alt: string }[] = [
  {
    name: "Ulu Ari",
    image: uluAri,
    alt: "Un teschio di bestia cornuto davanti a una falce di luna, fra asce, lance e scudi incisi.",
  },
  {
    name: "Elfi",
    image: elfi,
    alt: "Un teschio con una corona di rami davanti a lame ricurve, fra viticci e luci sospese.",
  },
  {
    name: "Gata Ari",
    image: gataAri,
    alt: "Un teschio felino blu fra lame ricurve, mazze chiodate e drappi rosa.",
  },
  {
    name: "Nani",
    image: nani,
    alt: "Un teschio con la barba intrecciata e un diadema d'oro, fra asce, martelli e ingranaggi.",
  },
  {
    name: "Orchi",
    image: orchi,
    alt: "Un teschio verde con le zanne, sporco di sangue, fra asce e clave incrociate.",
  },
  {
    name: "Umani",
    image: umani,
    alt: "Un teschio con una corona d'argento e un drappo rosso, fra spade e stendardi.",
  },
];

const SWIPE_THRESHOLD = 40; // px

// Vero solo dopo l'idratazione, senza un setState dentro un effetto.
const noop = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(noop, () => true, () => false);

/**
 * Lo slider dei popoli nell'intestazione: dissolvenza fra le tavole, una
 * leggera zoomata su quella attiva, avanzamento automatico ogni 6s (vedi
 * `hero-slider.module.css`), controlli e swipe.
 *
 * Dal server arriva solo la prima tavola, precaricata: è l'immagine più
 * grande della pagina e non deve aspettare le altre. Le altre cinque si
 * montano dopo l'idratazione, e senza JavaScript resta la prima, ferma.
 *
 * Accessibilità (pattern carousel di WAI-ARIA): regione con nome, ogni tavola
 * è un gruppo «N di 6», quelle nascoste sono `aria-hidden`; le novità si
 * annunciano solo a slider fermo, per non interrompere chi legge a ogni
 * cambio. Il pulsante pausa c'è perché il movimento dura più di 5s (WCAG
 * 2.2.2).
 */
export function HeroSlider() {
  const hydrated = useHydrated();
  const [index, setIndex] = useState(0);
  // La tavola che si vede sotto mentre la nuova entra in dissolvenza.
  const [previous, setPrevious] = useState<number | null>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<number | null>(null);

  const count = SLIDES.length;
  const playing = !userPaused;

  const go = (next: number) => {
    const target = (next + count) % count;
    if (target === index) return;
    setPrevious(index);
    setIndex(target);
  };

  // Fuori dallo schermo la barra si ferma: lo slide cambierebbe senza che
  // nessuno lo veda, e tornando su si ripartirebbe da metà giro.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carosello"
      aria-label="I popoli di Rysonance"
      className={`${styles.slider} ${userPaused || !onScreen ? styles.paused : ""} absolute inset-0 flex flex-col`}
    >
      {/*
        * Su mobile la tavola sfuma in alto e in basso nel bordeaux; su
        * desktop è un pannello netto, col taglio dritto come nel layout.
        * `touch-pan-y`: lo scroll verticale resta al browser, gli
        * spostamenti orizzontali arrivano a noi come swipe.
        */}
      <div
        aria-live={playing ? "off" : "polite"}
        className="relative min-h-0 flex-1 touch-pan-y overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_15%,#000_85%,transparent)] lg:[mask-image:none]"
        onPointerDown={(e) => {
          swipeStart.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (swipeStart.current === null) return;
          const dx = e.clientX - swipeStart.current;
          swipeStart.current = null;
          if (Math.abs(dx) > SWIPE_THRESHOLD) go(index + (dx < 0 ? 1 : -1));
        }}
        onPointerCancel={() => {
          swipeStart.current = null;
        }}
      >
        {SLIDES.map((slide, i) => {
          if (i > 0 && !hydrated) return null;
          const active = i === index;
          const under = i === previous;
          return (
            <div
              key={slide.name}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} di ${count}: ${slide.name}`}
              aria-hidden={!active}
              /*
               * La nuova tavola entra sopra (z-20) dissolvendo da 0 a 1,
               * mentre la precedente resta piena sotto (z-10): niente
               * mezzo tono in cui le due sono trasparenti e si vede il
               * fondo. Le altre spariscono subito.
               */
              className={`absolute inset-0 ${
                active
                  ? "z-20 opacity-100 transition-opacity duration-1000 ease-out motion-reduce:transition-none"
                  : under
                    ? "z-10 opacity-100"
                    : "z-0 opacity-0"
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                preload={i === 0}
                draggable={false}
                // iubenda aggiunge `data-cmp-info` alle <img> prima dell'idratazione.
                suppressHydrationWarning
                sizes="(min-width: 1024px) 50vw, 100vw"
                /*
                 * Zoomata lenta all'indietro mentre la tavola è attiva. Quella
                 * sotto resta com'è finché la nuova non l'ha coperta; poi,
                 * nascosta, torna di colpo a 1.06 per il giro successivo.
                 */
                className={`object-cover transition-transform ease-out select-none motion-reduce:scale-100 motion-reduce:transition-none ${
                  active || under
                    ? "scale-100 duration-[7000ms]"
                    : "scale-[1.06] duration-0"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Desktop: un velo scuro in basso, perché i controlli si leggano sulla tavola. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 hidden h-48 bg-gradient-to-t from-black/60 to-transparent lg:block"
      />

      {/* Controlli: sotto la tavola su mobile, sopra la tavola su desktop. */}
      <div className="relative z-40 mt-3 flex flex-col items-center gap-2 lg:absolute lg:inset-x-0 lg:bottom-10 lg:mt-0">
        <p
          aria-hidden="true"
          className="text-xs font-bold tracking-[0.25em] text-white uppercase"
        >
          {SLIDES[index].name}
        </p>
        <div className="flex items-center gap-1.5">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.name}
              type="button"
              onClick={() => go(i)}
              aria-label={`Mostra ${slide.name}`}
              aria-current={i === index ? "true" : undefined}
              className="group/dot flex h-6 w-8 items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/30 transition-colors group-hover/dot:bg-white/50">
                {i === index && (
                  <span
                    // La chiave fa ripartire l'animazione a ogni cambio.
                    key={index}
                    className={`${styles.fill} absolute inset-0 rounded-full bg-white`}
                    onAnimationEnd={() => go(index + 1)}
                  />
                )}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setUserPaused((paused) => !paused)}
            aria-label={
              userPaused ? "Riprendi lo slider" : "Metti in pausa lo slider"
            }
            className="ml-1 grid size-6 place-items-center rounded-sm text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true" className="size-3">
              {userPaused ? (
                <path d="M3 1.5v9l7.5-4.5z" />
              ) : (
                <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
