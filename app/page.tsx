import Image from "next/image";
import voidMonster from "@/assets/landing/void-monster.webp";
import { DisplayWord } from "@/components/landing/display-word";
import { ExploreSection } from "@/components/landing/explore-section";
import { HeroSlider } from "@/components/landing/hero-slider";
import { WRAP } from "@/components/landing/wrap";
import { Logo } from "@/components/logo";
import { WishlistForm } from "@/components/wishlist-form";
import { readAttribution } from "./wishlist/attribution";
import type { LANDING_FORMS } from "./wishlist/form";
import { readOutcome } from "./wishlist/outcome";

/**
 * La landing, nell'ordine dei layout: intestazione bordeaux con l'illustrazione,
 * «Esplora la nuova generazione», Scatena gli Eco / COMBATTI, iscrizione /
 * IMMAGINA. Il form della wishlist sta in cima e in fondo; l'esito dell'invio
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
    <main className="flex flex-1 flex-col font-sans">
      {/* ── Intestazione ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-burgundy text-white">
        {/*
          * Mobile: logo, testo, slider dei popoli (si allunga), form.
          * Desktop: logo, testo e form nella metà sinistra, fra due righe
          * elastiche; quella sopra è più alta (1.6fr) perché nel layout il
          * blocco sta più in basso del centro. Lo slider esce dalla griglia e
          * occupa la metà destra della sezione, fino al bordo della finestra.
          */}
        <div
          className={`${WRAP} grid min-h-svh grid-rows-[auto_auto_1fr_auto] pt-8 pb-10 lg:grid-cols-2 lg:grid-rows-[auto_1.6fr_auto_auto_1fr] lg:gap-x-12 lg:pt-16`}
        >
          {/*
            * Simbolo + lettering. Le larghezze sono quelle del solo lettering
            * di prima (w-44, lg:w-56) per 85.5/66.25, il rapporto fra i due
            * viewBox: le lettere restano della stessa misura e il simbolo si
            * aggiunge a sinistra.
            */}
          <Logo
            variant="full"
            className="mx-auto h-auto w-[14.25rem] lg:mx-0 lg:w-[18rem]"
          />

          <div className="mt-12 text-center lg:col-start-1 lg:row-start-3 lg:mt-0 lg:max-w-[22rem] lg:text-left">
            <h1 className="text-[31px] leading-[0.97] font-bold text-balance lg:text-[2rem]">
              Il mondo sta cambiando, unisciti alla rivoluzione.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-snug text-white/80 lg:mx-0 lg:text-[1.0625rem] lg:leading-[1.1]">
              Rysonance è il gioco di ruolo da tavolo in cui la tua avventura è
              connessa a quella di ogni altro giocatore tramite un’esperienza
              digitale ad hoc.
            </p>
          </div>

          {/* Su mobile da bordo a bordo; su desktop la metà destra della sezione. */}
          <div className="relative -mx-5 my-6 min-h-80 lg:absolute lg:inset-y-0 lg:right-0 lg:m-0 lg:w-1/2 lg:min-h-0">
            <HeroSlider />
          </div>

          <div className="mx-auto w-full max-w-md lg:col-start-1 lg:row-start-4 lg:mx-0 lg:mt-14 lg:max-w-[22rem]">
            {form("hero")}
          </div>
        </div>
      </section>

      {/* ── Esplora la nuova generazione (sezione bloccata allo scroll) ── */}
      <ExploreSection />

      {/* ── Scatena gli Eco · COMBATTI ───────────────────────────────── */}
      {/* `id`: ci porta «Scopri di più» della sezione sopra. */}
      <section id="eco" className="bg-paper text-ink">
        {/*
          * Il mostro pende dal bordo della sezione: l'immagine è tagliata in
          * alto, e il riquadro ne mostra solo la parte bassa. Su mobile va da
          * bordo a bordo; su desktop sta nella colonna, coi tagli laterali
          * del corpo dritti sul fondo chiaro, come nel layout.
          */}
        <div className="relative mx-auto aspect-[10/11] w-full overflow-hidden sm:aspect-[4/3] lg:aspect-[1000/967] lg:max-w-[60rem]">
          {/* suppressHydrationWarning: iubenda aggiunge `data-cmp-info` alle <img> prima dell'idratazione. */}
          <Image
            src={voidMonster}
            alt="Il Void Monster, una creatura scura coperta di occhi e con una fila di denti affilati."
            fill
            suppressHydrationWarning
            sizes="(min-width: 1024px) 60rem, 100vw"
            className="object-cover object-bottom"
          />
        </div>
        <div className={`${WRAP} pt-8 text-center`}>
          <h2 className="text-[clamp(2.75rem,7.5vw,6.75rem)] leading-none font-bold">
            Scatena gli Eco
          </h2>
          <p className="mx-auto mt-5 max-w-[30rem] text-[14px] leading-[1.25] text-ink/80 lg:text-[1.125rem] lg:leading-[1.15]">
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
          className={`${WRAP} grid gap-10 pt-16 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-12 lg:pt-60`}
        >
          <h2 className="max-w-[13em] text-[31px] leading-[0.97] font-bold lg:text-[2.625rem] lg:leading-[0.95]">
            Iscriviti alla wishlist e resta informato sugli sviluppi di
            Rysonance.
          </h2>
          <div className="w-full max-w-md">
            {form("immagina")}
          </div>
        </div>
        <DisplayWord word="IMMAGINA" className="mt-16 text-[#282828] lg:mt-32" />
      </section>
    </main>
  );
}
