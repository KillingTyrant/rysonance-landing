import { Suspense } from "react";
import { NO_ATTRIBUTION, readAttribution } from "@/app/wishlist/attribution";
import type { FormOrigin } from "@/app/wishlist/form";
import { readOutcome } from "@/app/wishlist/outcome";
import { WishlistForm } from "./wishlist-form";

type Params = Record<string, string | string[] | undefined>;

/**
 * Il form della wishlist in una pagina servita già pronta (Cache Components,
 * `cacheComponents` in `next.config.ts`).
 *
 * La pagina si prepara una volta, durante la build, e Vercel la manda subito
 * dalla sua rete: niente attesa del server a ogni visita, che sulle
 * connessioni lente è il tempo che pesa di più. Solo questo pezzo dipende
 * dalla singola visita: l'esito dell'iscrizione e da dove arriva chi visita
 * (query e `referer`, vedi `attribution.ts`). Per questo sta in un
 * `<Suspense>`: nella pagina pronta c'è il form vuoto (`fallback`), e nella
 * stessa risposta, appena il server l'ha letto, arriva quello con l'esito e
 * i campi nascosti dell'attribuzione, che prende il suo posto senza salti
 * (è lo stesso form). Lo scambio lo fa un piccolo script dentro la pagina,
 * senza aspettare il resto del JavaScript.
 *
 * Senza JavaScript resta il form vuoto: ci si iscrive lo stesso, ma la
 * conferma o l'errore dopo l'invio non si vedono.
 */
export function LiveWishlistForm({
  origin,
  searchParams,
  className,
}: {
  origin: FormOrigin;
  searchParams: Promise<Params>;
  className?: string;
}) {
  return (
    <Suspense
      fallback={
        <WishlistForm
          origin={origin}
          tone="dark"
          outcome={readOutcome({})}
          attribution={NO_ATTRIBUTION}
          className={className}
        />
      }
    >
      <FormForThisVisit origin={origin} searchParams={searchParams} className={className} />
    </Suspense>
  );
}

async function FormForThisVisit({
  origin,
  searchParams,
  className,
}: {
  origin: FormOrigin;
  searchParams: Promise<Params>;
  className?: string;
}) {
  const params = await searchParams;
  return (
    <WishlistForm
      origin={origin}
      tone="dark"
      outcome={readOutcome(params)}
      // È qui che arriva il traffico dei post: utm_* e referrer vanno letti
      // su questa pagina e passati al form, dopo il POST non ci sarebbero più.
      attribution={await readAttribution(params)}
      className={className}
    />
  );
}
