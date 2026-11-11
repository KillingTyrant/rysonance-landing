import Image from "next/image";
import squarcio from "@/assets/landing/squarcio.webp";
import voidMonster from "@/assets/landing/void-monster.webp";
import { ChoiceCards } from "@/components/landing/choice-cards";
import { DisplayWord } from "@/components/landing/display-word";
import { Logo } from "@/components/logo";
import { WishlistForm } from "@/components/wishlist-form";
import { readAttribution } from "./wishlist/attribution";
import type { LANDING_FORMS } from "./wishlist/form";
import { readOutcome } from "./wishlist/outcome";

/**
 * La landing, nell'ordine dei layout: intestazione bordeaux, «Esplora la nuova
 * generazione», ESPLORA / Scatena gli Eco, IMMAGINA. Ogni sezione chiude col
 * form della wishlist; l'esito dell'invio torna nel form usato (vedi
 * `ORIGIN_FIELD` in `wishlist/form.ts`).
 */
export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const outcome = readOutcome(params);
  // È qui che arriva il traffico dei post: utm_* e referrer vanno letti su
  // questa pagina e passati al form, dopo il POST non ci sarebbero più.
  const attribution = await readAttribution(params);

  const form = (
    origin: (typeof LANDING_FORMS)[number],
    tone: "dark" | "light",
  ) => (
    <WishlistForm
      origin={origin}
      tone={tone}
      outcome={outcome}
      attribution={attribution}
    />
  );

  return (
    <main className="flex flex-1 flex-col font-sans">
      {/* ── Intestazione ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-burgundy text-white [--ticket-ink:var(--color-burgundy)]">
        {/*
          * Mobile: logo, testo, squarcio (si allunga), form. Desktop: testo e
          * form a sinistra, centrati in verticale fra due righe elastiche; lo
          * squarcio esce dalla griglia e si appoggia alla sezione.
          */}
        <div className="mx-auto grid min-h-svh max-w-6xl grid-rows-[auto_auto_1fr_auto] px-5 pt-8 pb-10 lg:grid-cols-2 lg:grid-rows-[auto_1fr_auto_auto_1fr] lg:gap-x-12 lg:px-10 lg:pb-16">
          <Logo
            variant="wordmark"
            className="mx-auto h-auto w-44 lg:col-span-2 lg:w-52"
          />

          <div className="relative z-10 mt-12 text-center lg:col-start-1 lg:row-start-3 lg:mt-0 lg:text-left">
            <h1 className="text-[31px] leading-[0.97] font-bold text-balance lg:text-5xl">
              Il mondo sta cambiando, unisciti alla rivoluzione.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-snug text-white/80 lg:mx-0 lg:text-lg">
              Rysonance è il gioco di ruolo da tavolo in cui la tua avventura è
              connessa a quella di ogni altro giocatore tramite un’esperienza
              digitale ad hoc.
            </p>
          </div>

          {/*
            * Lo squarcio riempie lo spazio vuoto del layout. È ancorato in
            * basso con le sue proporzioni: se il riquadro è più basso
            * dell'immagine, la parte alta (trasparente, salvo la punta dello
            * strappo) sale dietro al testo invece di essere tagliata. Sfuma in
            * basso nel bordeaux, così il form resta su fondo pieno.
            *
            * Su desktop occupa l'angolo in basso a destra della sezione, fino
            * al bordo della finestra; il lato sinistro, che nell'immagine è un
            * taglio netto, sfuma nel bordeaux.
            *
            * suppressHydrationWarning (anche sul mostro): il blocco automatico
            * di iubenda aggiunge `data-cmp-info` alle <img> prima
            * dell'idratazione.
            */}
          <div className="relative -mx-5 my-4 min-h-56 lg:absolute lg:inset-y-0 lg:right-0 lg:m-0 lg:w-3/5 lg:min-h-0">
            <Image
              src={squarcio}
              alt=""
              preload
              suppressHydrationWarning
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="pointer-events-none absolute right-0 bottom-0 h-auto w-full max-w-none [mask-image:linear-gradient(to_bottom,#000_75%,transparent)] lg:h-[125%] lg:w-auto lg:[mask-image:linear-gradient(to_right,transparent,#000_45%)]"
            />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-md lg:col-start-1 lg:row-start-4 lg:mx-0 lg:mt-10">
            {form("hero", "dark")}
          </div>
        </div>
      </section>

      {/* ── Esplora la nuova generazione ─────────────────────────────── */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-5 pt-14 pb-16 lg:px-10 lg:pt-24">
          <h2 className="max-w-2xl text-[31px] leading-[0.97] font-bold lg:text-5xl">
            Esplora la nuova generazione del gioco di ruolo
          </h2>
          <div className="mt-6">
            <ChoiceCards />
          </div>
          <div className="mx-auto mt-10 max-w-md">{form("esplora", "dark")}</div>
        </div>
      </section>

      {/* ── ESPLORA · Scatena gli Eco ────────────────────────────────── */}
      <section className="bg-paper text-ink">
        <div className="bg-ink pt-6 text-white lg:pt-12">
          <DisplayWord word="ESPLORA" />
        </div>
        {/*
          * Il mostro pende dalla fascia scura: l'immagine è tagliata in alto
          * e il bordo combacia con la fascia. Il riquadro ne nasconde la
          * parte alta, come nel layout. Resta a tutta larghezza anche su
          * desktop: il corpo è tagliato anche ai lati, e in un riquadro
          * centrato quei tagli si vedrebbero sul fondo chiaro.
          */}
        <div className="relative aspect-[10/11] w-full overflow-hidden sm:aspect-[4/3] lg:aspect-[16/9]">
          <Image
            src={voidMonster}
            alt="Il Void Monster, una creatura scura coperta di occhi e con una fila di denti affilati."
            fill
            suppressHydrationWarning
            sizes="100vw"
            className="object-cover object-bottom"
          />
        </div>
        <div className="mx-auto max-w-xl px-5 pt-10 pb-16 lg:pb-24">
          <h2 className="text-[31px] leading-[0.97] font-bold lg:text-4xl">
            Scatena gli Eco
          </h2>
          <p className="mt-4 text-[14px] leading-[1.25] text-ink/80 lg:text-lg">
            In Rysonance le tue scelte sono intimamente connesse con il mondo di
            gioco. Il sistema tiene conto delle scelte del gruppo, dei mostri
            sconfitti e degli oggetti recuperati, generando “gli eco”, modifiche
            temporanee all’ambientazione e alla trama, che tutti i giocatori in
            ogni parte del mondo possono adottare. Così, le azioni del tuo party
            potranno risuonare per il globo.
          </p>
          <div className="mt-8">{form("eco", "light")}</div>
        </div>
      </section>

      {/* ── IMMAGINA ─────────────────────────────────────────────────── */}
      <section className="bg-coal text-white [--ticket-ink:var(--color-coal)]">
        <div className="bg-burgundy pt-3 pb-1">
          <DisplayWord word="IMMAGINA" />
        </div>
        <div className="mx-auto max-w-xl px-5 pt-14 pb-16 lg:pt-24 lg:pb-24">
          <h2 className="text-[31px] leading-[0.97] font-bold lg:text-4xl">
            Reimmagina il modo di giocare di ruolo da tavolo.
          </h2>
          <p className="mt-4 text-[14px] leading-[1.25] text-white/80 lg:text-lg">
            Rysonance è il gioco di ruolo da tavolo in cui la tua avventura è
            connessa a quella di ogni altro giocatore tramite un sistema online
            che rende l’esperienza sia immaginativa che digitale.
          </p>
          <div className="mt-8">{form("immagina", "dark")}</div>
        </div>
      </section>
    </main>
  );
}
