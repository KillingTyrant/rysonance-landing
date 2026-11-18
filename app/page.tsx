import type { CSSProperties } from "react";
import Image from "next/image";
import voidMonster from "@/assets/landing/void-monster.webp";
import { DisplayWord } from "@/components/landing/display-word";
import { ExploreSection } from "@/components/landing/explore-section";
import { HeroSlider } from "@/components/landing/hero-slider";
import { SlideStack } from "@/components/landing/slide-stack";
import { NARROW, WRAP } from "@/components/landing/wrap";
import { Navbar } from "@/components/layout/navbar";
import { WishlistForm } from "@/components/wishlist-form";
import { readAttribution } from "./wishlist/attribution";
import type { LANDING_FORMS } from "./wishlist/form";
import { readOutcome } from "./wishlist/outcome";

/**
 * Il Void Monster, a tutta larghezza in un riquadro con `fill`: `className`
 * dice quale parte se ne vede (`object-top`, `object-bottom`). Solo una delle
 * due copie ha il testo alternativo, l'altra è lo stesso disegno.
 * suppressHydrationWarning: iubenda aggiunge `data-cmp-info` alle <img> prima
 * dell'idratazione.
 */
function Monster({ className, alt = "" }: { className: string; alt?: string }) {
  return (
    <Image
      src={voidMonster}
      alt={alt}
      fill
      sizes="100vw"
      suppressHydrationWarning
      className={className}
    />
  );
}

/** L'altezza del mostro a tutta larghezza, in larghezze della sezione (`cqw`). */
const MONSTER_HEIGHT = `${(voidMonster.height / voidMonster.width) * 100}cqw`;

/**
 * La landing, nell'ordine dei layout: intestazione bordeaux con l'illustrazione,
 * «Esplora la nuova generazione» e Scatena gli Eco / COMBATTI (una sezione
 * sola, col Void Monster in mezzo), iscrizione / IMMAGINA. Il form della wishlist sta in cima, in «Esplora» e in fondo; l'esito dell'invio
 * torna nel form usato (vedi `ORIGIN_FIELD` in `wishlist/form.ts`).
 */
export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const outcome = readOutcome(params);
  // È qui che arriva il traffico dei post: utm_* e referrer vanno letti su
  // questa pagina e passati al form, dopo il POST non ci sarebbero più.
  const attribution = await readAttribution(params);

  const form = (origin: (typeof LANDING_FORMS)[number]) => (
    <WishlistForm
      origin={origin}
      tone="dark"
      outcome={outcome}
      attribution={attribution}
    />
  );

  return (
    <>
      {/* Fuori dal <main>: le sezioni impilate sono i suoi figli diretti. */}
      <Navbar />

      {/*
        * Le sezioni si impilano: ognuna resta ferma e si rimpicciolisce mentre
        * la successiva le scorre sopra (vedi `slide-stack.tsx`). Il nero si
        * vede solo dietro la sezione che si rimpicciolisce, e ne disegna i
        * bordi anche quando è scura come la pagina.
        */}
      <SlideStack className="flex flex-1 flex-col bg-black font-sans">
        {/* ── Intestazione ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-burgundy text-white">
          {/*
            * Il logo sta nella barra in alto (`Navbar`), fissa e alta 64px: il
            * contenuto parte sotto (`pt-16`).
            * Mobile: testo, slider dei popoli (si allunga), form.
            * Desktop: testo e form nella metà sinistra, fra due righe
            * elastiche; quella sopra è più alta (1.6fr) perché nel layout il
            * blocco sta più in basso del centro. Lo slider esce dalla griglia e
            * occupa il 42% destro della sezione, fino al bordo della finestra.
            */}
          <div
            className={`${WRAP} grid min-h-svh grid-rows-[auto_1fr_auto] pt-16 pb-10 lg:grid-cols-2 lg:grid-rows-[1.6fr_auto_auto_1fr] lg:gap-x-12`}
          >
            {/*
              * Il titolo è molto grande e prende tutta la metà sinistra su
              * desktop: misure scelte perché stia su tre righe (2,375rem sul
              * telefono a 375px, 3,25rem nei 28,5rem della colonna desktop).
              */}
            <div className="mt-8 text-center lg:col-start-1 lg:row-start-2 lg:mt-0 lg:text-left">
              <h1 className="text-[2.375rem] leading-[0.95] font-extrabold text-balance sm:text-[3.25rem] lg:leading-[0.92]">
                Il gioco di ruolo da tavolo come non lo hai mai immaginato.
              </h1>
              <p className="mx-auto mt-5 max-w-md text-[18.75px] leading-snug text-white/80 lg:mx-0 lg:max-w-none lg:text-[1.328125rem] lg:leading-[1.1]">
                Rysonance è il gioco di ruolo da tavolo che abbatte le barriere di
                ingresso con un’esperienza facile, profonda ed intuitiva. Entra in
                un gioco connesso dove le tue azioni e quelle dei tuoi amici
                influenzano il mondo di gioco.
              </p>
            </div>

            {/*
              * Su mobile da bordo a bordo; su desktop la parte destra della
              * sezione, fino al bordo della finestra. Il 42% e non la metà:
              * così fra il testo (la metà sinistra della colonna) e
              * l'illustrazione resta aria (circa 140px a 1440).
              */}
            <div className="relative -mx-5 my-6 min-h-80 lg:absolute lg:inset-y-0 lg:right-0 lg:m-0 lg:w-[42%] lg:min-h-0">
              <HeroSlider />
            </div>

            <div className="mx-auto w-full max-w-md lg:col-start-1 lg:row-start-3 lg:mx-0 lg:mt-14 lg:max-w-[22rem]">
              {form("hero")}
            </div>
          </div>
        </section>

        {/*
          * ── Esplora la nuova generazione · Scatena gli Eco · COMBATTI ──
          * Un'unica sezione per `SlideStack`: dopo «Esplora» si continua a
          * scorrere fino agli Eco, e il cambio di sezione scatta solo quando
          * arriva l'iscrizione.
          *
          * Tablet e desktop: il Void Monster è a tutta larghezza e parte da
          * «Esplora». La sua parte alta fa da sfondo al blocco fermo di
          * «Esplora» (`backdrop`); finito il blocco, il resto scorre sotto
          * senza giunture fino ai denti: il riquadro qui sotto è alto quanto il
          * mostro meno lo schermo, e ne mostra la parte bassa.
          * Telefono: «Esplora» scorre su fondo blu notte (#020817), poi il
          * mostro intero, che esce da quel blu con una sfumatura.
          *
          * `@container`: le altezze si misurano sulla larghezza della sezione
          * (`cqw`), non della finestra, che su Windows comprende la barra di
          * scorrimento e sfaserebbe le due parti del mostro.
          */}
        <section
          id="eco"
          className="@container bg-paper text-ink"
          style={
            {
              "--monster-h": MONSTER_HEIGHT,
              "--monster-ratio": `${voidMonster.width} / ${voidMonster.height}`,
            } as CSSProperties
          }
        >
          <ExploreSection
            form={form("esplora")}
            backdrop={<Monster className="object-cover object-top" />}
          />

          {/*
            * `md:-mt-0.5` e i 2px in più: il riquadro copre di 2px il fondo
            * dello sfondo di «Esplora», che mostra la stessa striscia di
            * mostro; senza, il bordo dei due ritagli si vede come una riga.
            */}
          <div className="relative aspect-(--monster-ratio) w-full overflow-hidden md:-mt-0.5 md:aspect-auto md:h-[max(0px,calc(var(--monster-h)_-_100svh_+_2px))]">
            <Monster
              alt="Il Void Monster, una creatura scura coperta di occhi e con una fila di denti affilati."
              className="object-cover object-bottom"
            />
            {/* Telefono: il mostro esce dal blu notte di «Esplora». */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#020817_0%,transparent_45%)] md:hidden" />
          </div>

          <div className={`${WRAP} pt-8 text-center`}>
            <h2 className="text-[clamp(2.75rem,7.5vw,6.75rem)] leading-none font-extrabold">
              Scatena gli Eco
            </h2>
            {/*
              * Il titolo cresce con la finestra (7,5vw, fino a 6,75rem) ed è
              * largo circa 6,6 volte la sua altezza, cioè 50vw (fino a 45rem).
              * Il paragrafo gli va dietro, un po' più largo: 55vw, almeno 30rem
              * e al massimo 49,5rem, quando il titolo smette di crescere.
              */}
            <p className="mx-auto mt-5 max-w-[clamp(30rem,55vw,49.5rem)] text-[17.5px] leading-[1.25] text-ink/80 lg:text-[1.40625rem] lg:leading-[1.15]">
              In Rysonance le tue scelte sono intimamente connesse con il mondo di
              gioco. Il sistema tiene conto delle scelte del gruppo, dei mostri
              sconfitti e degli oggetti recuperati, generando “gli eco”, modifiche
              temporanee all’ambientazione e alla trama, che tutti i giocatori in
              ogni parte del mondo possono adottare. Così, le azioni del tuo party
              potranno risuonare nel mondo.
            </p>
          </div>
          <DisplayWord word="COMBATTI" className="mt-16 text-[#d7d7d7] lg:mt-32" />
        </section>

        {/* ── Iscrizione · IMMAGINA ────────────────────────────────────── */}
        <section className="bg-coal text-white">
          <div
            className={`${WRAP} ${NARROW} grid gap-10 pt-16 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-12 lg:pt-60`}
          >
            <h2 className="max-w-[13em] text-[31px] leading-[0.97] font-extrabold lg:text-[2.625rem] lg:leading-[0.95]">
              Iscriviti alla wishlist e resta informato sugli sviluppi di
              Rysonance.
            </h2>
            <div className="w-full max-w-md">
              {form("immagina")}
            </div>
          </div>
          <DisplayWord word="IMMAGINA" className="mt-16 text-[#282828] lg:mt-32" />
        </section>
      </SlideStack>
    </>
  );
}
