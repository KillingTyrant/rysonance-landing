import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import voidMonster from "@/assets/landing/void-monster.webp";
import { AwakeningTitle } from "@/components/landing/awakening-title";
import { DisplayWord } from "@/components/landing/display-word";
import { ExploreSection } from "@/components/landing/explore-section";
import { FaqSection } from "@/components/landing/faq-section";
import { RoundLink } from "@/components/landing/round-link";
import { FAQS } from "@/components/landing/faqs";
import { HeroSlider } from "@/components/landing/hero-slider";
import { SlideStack } from "@/components/landing/slide-stack";
import { NARROW, WRAP } from "@/components/landing/wrap";
import { Navbar } from "@/components/layout/navbar";
import { LiveWishlistForm } from "@/components/live-wishlist-form";
import type { LANDING_FORMS } from "./wishlist/form";
import { SOCIAL } from "@/components/layout/social";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "./site";

/**
 * L'indirizzo canonico della landing: le varianti con la query (gli utm_*
 * delle campagne, l'esito dell'iscrizione) sono la stessa pagina.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * I dati strutturati (schema.org, JSON-LD) per Google e per i motori di
 * risposta delle IA: chi c'è dietro (Organization), il sito (WebSite), questa
 * pagina (WebPage), il gioco (Game) e le domande frequenti (FAQPage, dallo
 * stesso elenco della sezione visibile). Solo fatti già scritti sulla pagina.
 */
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      // I profili social: Google li collega al sito (pannello del marchio).
      sameAs: Object.values(SOCIAL),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "it-IT",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: SITE_TITLE,
      description: SITE_DESCRIPTION,
      inLanguage: "it-IT",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#game` },
      primaryImageOfPage: `${SITE_URL}/opengraph-image.jpg`,
    },
    {
      "@type": "Game",
      "@id": `${SITE_URL}/#game`,
      name: SITE_NAME,
      url: SITE_URL,
      image: `${SITE_URL}/opengraph-image.jpg`,
      description:
        "Il gioco di ruolo da tavolo che abbatte le barriere di ingresso con un’esperienza digitale facile, profonda ed intuitiva: un gioco connesso, in cui le azioni di ogni party influenzano un mondo di gioco condiviso tra tutti i party.",
      genre: ["Gioco di ruolo da tavolo", "GdR"],
      inLanguage: "it",
      audience: {
        "@type": "PeopleAudience",
        audienceType: "Chi vuole iniziare a giocare di ruolo da tavolo",
      },
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#domande`,
      url: `${SITE_URL}/#domande`,
      inLanguage: "it-IT",
      isPartOf: { "@id": `${SITE_URL}/#webpage` },
      mainEntity: FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ],
};

/**
 * Il Void Monster, a tutta larghezza in un riquadro con `fill`: `className`
 * dice quale parte se ne vede (`object-top`, `object-bottom`). Solo una delle
 * due copie ha il testo alternativo, l'altra è lo stesso disegno.
 * suppressHydrationWarning: iubenda aggiunge `data-cmp-info` alle <img> prima
 * dell'idratazione.
 */
function Monster({
  className,
  alt = "",
  sizes = "100vw",
}: {
  className: string;
  alt?: string;
  sizes?: string;
}) {
  return (
    <Image
      src={voidMonster}
      alt={alt}
      fill
      sizes={sizes}
      suppressHydrationWarning
      className={className}
    />
  );
}

/**
 * Le `sizes` dello sfondo di «Esplora», che c'è solo con `wide:` (stessa
 * condizione di `globals.css`): lì è a tutta larghezza, altrove è nascosto e
 * largo zero. Con un semplice "100vw" Next, in sviluppo, avverte che
 * l'immagine non è larga quanto la finestra.
 */
const WIDE_ONLY_SIZES = "(min-width: 48rem) and (min-aspect-ratio: 1/1) 100vw, 1px";

/**
 * Di quanto sale al massimo il mostro dietro «Esplora» mentre la linea oro
 * scende (il parallasse, vedi `DRIFT_ON` in `explore-section.tsx`): il 90% di
 * un tratto che arriva al 30% dello schermo (il parallasse è più lento del 10%,
 * così sotto la frase resta più disegno), lasciando sempre posto alla frase
 * «Il mondo ha bisogno…» nel pezzo che continua sotto. Il tratto libero lì è
 * il mostro meno lo schermo e i denti (gli ultimi 25cqw); la frase, su due
 * righe, è alta circa il 16% della sua larghezza (`min(100cqw - 2,5rem, 80rem)`, vedi
 * `awakening-title.module.css`): 0,18 con un po' di margine. Sugli schermi
 * quasi quadrati lo spazio è poco e il mostro sale meno.
 * Esempi: 1440×1024 → 276px, 1024×768 → 207px, 1024×1000 → 45px.
 * Se cambiano la frase o la sua misura, va rivisto lo 0,18.
 */
const MONSTER_DRIFT_MAX =
  "calc(0.9 * max(0px, min(30svh, var(--monster-h) - 100svh - 25cqw - min(100cqw - 2.5rem, 80rem) * 0.18)))";

/** L'altezza del mostro a tutta larghezza, in larghezze della sezione (`cqw`). */
const MONSTER_HEIGHT = `${(voidMonster.height / voidMonster.width) * 100}cqw`;

/**
 * La landing, nell'ordine dei layout: intestazione bordeaux con l'illustrazione,
 * «Esplora la nuova generazione» e Scatena gli Eco / COMBATTI (una sezione
 * sola, col Void Monster in mezzo), iscrizione / IMMAGINA. Il form della wishlist sta in cima, in «Esplora» e in fondo; l'esito dell'invio
 * torna nel form usato (vedi `ORIGIN_FIELD` in `wishlist/form.ts`).
 *
 * La pagina è pronta prima della visita: Vercel la manda subito dalla sua
 * rete. Solo i form dipendono dalla visita (esito e attribuzione) e arrivano
 * nella stessa risposta, al posto del form vuoto (`LiveWishlistForm`).
 */
export default function Home({ searchParams }: PageProps<"/">) {
  const form = (origin: (typeof LANDING_FORMS)[number]) => (
    <LiveWishlistForm origin={origin} searchParams={searchParams} />
  );

  return (
    <>
      {/*
        * Dati strutturati: un <script> normale e non next/script, perché non è
        * codice da eseguire. `<` diventa `\u003c`, come consiglia la guida di
        * Next, così il testo non può chiudere il tag.
        * suppressHydrationWarning: prima dell'idratazione iubenda gli aggiunge
        * `data-cmp-info`, come alle <img>.
        */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(STRUCTURED_DATA).replace(/</g, "\\u003c"),
        }}
      />

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
        <section className="relative flex min-h-svh flex-col overflow-hidden bg-[#020817] text-white lg:block lg:bg-burgundy">
          {/*
            * Telefono e tablet: lo spazio fra la barra in alto (64px) e il
            * titolo è un riquadro a sé, e la tavola dello slider si aggancia
            * al suo centro: il teschio, che in tutte le tavole sta al 55%
            * dell'altezza (`--skull`), cade sempre a metà fra il logo e il
            * titolo, qualunque sia l'altezza dello schermo. La tavola è larga
            * il 130% della sezione (tagliata ai lati) e sborda sopra e sotto
            * il riquadro; in fondo sfuma nel blu notte di «Esplora» (#020817),
            * la sezione che segue, così le due si legano senza stacco. Ci
            * sono solo le tavole che scorrono, senza controlli.
            * Desktop: il riquadro non conta (`lg:static`) e la tavola è la
            * parte destra della sezione, fino al bordo della finestra: il 42%
            * e non la metà, così fra il testo (la metà sinistra della colonna)
            * e l'illustrazione resta aria (circa 140px a 1440).
            */}
          <div className="relative mt-16 min-h-40 flex-1 lg:static lg:m-0 lg:min-h-0">
            <div
              style={{ "--skull": "55%" } as CSSProperties}
              className="absolute top-1/2 left-1/2 isolate aspect-[1000/1396] w-[130%] -translate-x-1/2 -translate-y-(--skull) [mask-image:linear-gradient(to_bottom,#000_75%,transparent)] lg:inset-y-0 lg:right-0 lg:left-auto lg:aspect-auto lg:w-[42%] lg:translate-none lg:[mask-image:none]"
            >
              {/* `isolate`: i livelli interni dello slider (z-20, z-40) restano sotto il testo. */}
              <HeroSlider />
            </div>
          </div>

          {/*
            * Il logo sta nella barra in alto (`Navbar`), fissa e alta 64px.
            * Telefono e tablet: titolo, testo e form in fondo, sopra la tavola,
            * su un fondo che sale dal blu notte e sfuma in alto (`before:`),
            * così si leggono anche sulle tavole chiare. `z-10`: il blocco ha un livello
            * suo, così quel fondo (`-z-10`) resta sopra la tavola e sotto il
            * testo.
            * Desktop: testo e form nella metà sinistra, fra due righe
            * elastiche; quella sopra è più alta (1.6fr) perché nel layout il
            * blocco sta più in basso del centro. Il contenuto parte sotto la
            * barra (`pt-16`).
            */}
          <div
            className={`${WRAP} relative z-10 pb-10 before:pointer-events-none before:absolute before:inset-x-0 before:-top-24 before:bottom-0 before:-z-10 before:bg-[linear-gradient(to_bottom,transparent_0%,rgb(2_8_23/0.75)_6rem,#020817_75%)] lg:grid lg:min-h-svh lg:grid-cols-2 lg:grid-rows-[1.6fr_auto_auto_1fr] lg:gap-x-12 lg:pt-16 lg:before:hidden`}
          >
            {/*
              * Il titolo è molto grande e prende tutta la metà sinistra su
              * desktop (2,375rem sul telefono a 375px, 3,25rem nei 28,5rem
              * della colonna desktop); `text-balance` tiene le righe di
              * lunghezza simile.
              * Da tablet (`sm:`) il blocco si allarga a 44rem: titolo e
              * paragrafo stanno su due o tre righe, il blocco è più basso e
              * l'illustrazione sopra ha più spazio.
              */}
            <div className="mx-auto w-full max-w-md text-center sm:max-w-[44rem] lg:col-start-1 lg:row-start-2 lg:mx-0 lg:max-w-none lg:text-left">
              <h1 className="text-[2.375rem] leading-[0.95] font-extrabold text-balance sm:text-[3.25rem] lg:leading-[0.92]">
                Tutta l’epica del gioco di ruolo senza gli attriti del gioco di ruolo.
              </h1>
              <p className="mt-5 text-[18.75px] leading-snug text-pretty text-white/80 lg:text-[1.328125rem] lg:leading-[1.1]">
                Rysonance è il gioco di ruolo da tavolo che abbatte le barriere di
                ingresso con un’esperienza digitale facile, profonda ed intuitiva.
                Che tu sia un principiante o un veterano, puoi vivere un’avventura
                in un gioco connesso dove le tue azioni e quelle dei tuoi amici
                influenzano il mondo di gioco.
              </p>
            </div>

            <div className="mx-auto mt-8 w-full max-w-md lg:col-start-1 lg:row-start-3 lg:mx-0 lg:mt-14 lg:max-w-[22rem]">
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
          * Tablet in orizzontale e desktop (`wide:`, vedi `globals.css`): il
          * Void Monster è a tutta larghezza e parte da «Esplora». La sua parte alta fa da sfondo al blocco fermo di
          * «Esplora» (`backdrop`); finito il blocco, il resto scorre sotto
          * senza giunture fino ai denti: il riquadro qui sotto è alto quanto il
          * mostro meno lo schermo, e ne mostra la parte bassa.
          * Telefono e schermi in verticale: «Esplora» su fondo blu notte
          * (#020817), poi il mostro intero, che esce da quel blu con una
          * sfumatura.
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
              "--monster-drift-max": MONSTER_DRIFT_MAX,
            } as CSSProperties
          }
        >
          <ExploreSection
            form={form("esplora")}
            backdrop={
              <Monster className="object-cover object-top" sizes={WIDE_ONLY_SIZES} />
            }
          />

          {/*
            * `wide:-mt-0.5` e i 2px in più: il riquadro copre di 2px il fondo
            * dello sfondo di «Esplora», che mostra la stessa striscia di
            * mostro; senza, il bordo dei due ritagli si vede come una riga.
            * Meno `--monster-drift`: durante «Esplora» lo sfondo sale di quel
            * tratto (parallasse), quindi il pezzo che continua qui parte più
            * in basso dello stesso tratto (vedi `MONSTER_DRIFT_MAX`).
            * `overflow-clip` e non `hidden`: `hidden` ne farebbe un contenitore
            * di scroll, e la dissolvenza della frase (legata alla sua posizione
            * nella finestra) si misurerebbe su di lui.
            */}
          <div className="relative aspect-(--monster-ratio) w-full overflow-clip wide:-mt-0.5 wide:aspect-auto wide:h-[max(0px,calc(var(--monster-h)_-_100svh_-_var(--monster-drift,0px)_+_2px))]">
            <Monster
              alt="Il Void Monster, una creatura scura coperta di occhi e con una fila di denti affilati."
              className="object-cover object-bottom"
            />
            {/* Telefono e schermi in verticale: il mostro esce dal blu notte di «Esplora». */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#020817_0%,transparent_45%)] wide:hidden" />
            {/*
              * La frase sta nel tratto libero del mostro, fra l'inizio del
              * riquadro e i denti, che occupano gli ultimi 25cqw. Più larga
              * della colonna: sta sopra l'illustrazione, non sul testo.
              */}
            <div className="absolute inset-x-0 top-0 bottom-[25cqw] flex items-center justify-center px-5 text-center">
              <AwakeningTitle />
            </div>
          </div>

          <div className={`${WRAP} pt-8 text-center`}>
            <h2 className="text-[clamp(2.75rem,7.5vw,6.75rem)] leading-none font-extrabold">
              Scatena gli Eco
            </h2>
            {/*
              * Il testo, poi un bottone piccolo e tondo che scende morbido
              * all'iscrizione in fondo alla pagina (`#iscriviti`).
              */}
            <p className="mx-auto mt-8 max-w-[clamp(34rem,62vw,56rem)] text-[1.375rem] leading-[1.2] text-pretty text-ink/80 lg:mt-10 lg:text-[1.75rem] lg:leading-[1.15]">
              Gli Eco sono le risonanze delle vostre scelte e delle vostre
              azioni. Possono arrivare alle sessioni di altri giocatori e
              influenzano il mondo di gioco con spunti di trama, cambiamenti
              alle regole o creazione di nuovi oggetti o… mostri!{" "}
              {/* La chiusa non si spezza: va a capo tutta insieme. */}
              <span className="whitespace-nowrap">Questa sì che è magia.</span>
            </p>
            <div className="mt-8 lg:mt-10">
              <RoundLink to="iscriviti">Scopri di più</RoundLink>
            </div>
          </div>
          <DisplayWord word="COMBATTI" className="mt-28 text-[#d7d7d7] md:mt-40 lg:mt-60" />
        </section>

        {/* ── Iscrizione · IMMAGINA ────────────────────────────────────── */}
        <section className="bg-coal text-white">
          {/* Le domande di chi vuole iniziare a giocare, prima dell'iscrizione. */}
          <FaqSection />
          <div
            className={`${WRAP} ${NARROW} grid gap-10 pt-16 md:grid-cols-[1fr_22rem] md:items-start md:gap-12 lg:pt-40`}
          >
            {/* `iscriviti`: qui porta «Scopri di più» degli Eco (`RoundLink`), che ci sposta anche il fuoco. */}
            <h2
              id="iscriviti"
              tabIndex={-1}
              className="max-w-[13em] text-[31px] leading-[0.97] font-extrabold outline-none lg:text-[2.625rem] lg:leading-[0.95]"
            >
              Ricevi gli aggiornamenti sullo sviluppo del mondo di Rysonance.
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
