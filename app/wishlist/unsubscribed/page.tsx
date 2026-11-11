import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { isValidEmail, normalizeEmail } from "../email";
import { first } from "../params";

/**
 * Pagina di atterraggio dopo la disiscrizione: qui ci arriva chi ha appena
 * cliccato il link di cancellazione, mandato dal redirect di chi gestisce
 * davvero la rimozione — Mailchimp, con la «Unsubscribe success page»
 * dell'audience (Audience → Signup forms → Form builder) impostata su
 * `/wishlist/unsubscribed`. La pagina non cancella niente — è solo la
 * conferma — quindi va raggiunta *dopo* che la rimozione è andata a buon fine.
 *
 * L'indirizzo, se c'è, si passa in `?email=`: serve solo a far vedere quale
 * casella è stata tolta, quando ne hai più di una.
 */
export const metadata: Metadata = {
  title: "Iscrizione cancellata — Rysonance",
  description: "L'indirizzo è stato tolto dalla wishlist di Rysonance.",
  // Una pagina di conferma non ha niente da offrire a chi arriva da una
  // ricerca, e finirebbe indicizzata con l'indirizzo nella query.
  robots: { index: false, follow: false },
};

export default async function Unsubscribed({
  searchParams,
}: PageProps<"/wishlist/unsubscribed">) {
  const params = await searchParams;

  // Stessa cautela della conferma di iscrizione: l'indirizzo arriva dall'URL,
  // quindi si ri-valida prima di stamparlo. Se non è plausibile si mostra la
  // conferma senza indirizzo, che regge lo stesso.
  const email = normalizeEmail(first(params.email));
  const confirmed = isValidEmail(email) ? email : "";

  return (
    <main className="flex flex-1 flex-col bg-burgundy font-sans text-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-8 pb-10">
        <Link href="/" aria-label="Torna alla home di Rysonance" className="mx-auto">
          <Logo variant="full" className="h-auto w-[14.25rem]" />
        </Link>

        <div className="my-auto py-12 text-center">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="mx-auto size-8 text-gold"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM6.75 9.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z"
              clipRule="evenodd"
            />
          </svg>
          <h1 className="mt-5 text-[1.9375rem] leading-[0.97] font-bold">
            Iscrizione cancellata
          </h1>
          <p className="mt-4 text-[0.9375rem] leading-snug text-white/80">
            {confirmed ? (
              <>
                Abbiamo tolto{" "}
                <span className="font-bold text-white">{confirmed}</span>{" "}
                dalla wishlist di Rysonance. Non ti scriveremo più.
              </>
            ) : (
              <>
                Abbiamo tolto il tuo indirizzo dalla wishlist di Rysonance.
                Non ti scriveremo più.
              </>
            )}
          </p>
          <p className="mt-4 text-sm text-white/70">
            Se è stato un errore, o se cambi idea,{" "}
            <Link
              href="/wishlist"
              className="font-bold text-white underline underline-offset-2 hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              puoi rimetterti in lista
            </Link>{" "}
            quando vuoi.
          </p>
        </div>
      </div>
    </main>
  );
}
