import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { isValidEmail, normalizeEmail } from "../email";
import { first } from "../params";

/**
 * Pagina di atterraggio dopo la disiscrizione: qui ci arriva chi ha appena
 * cliccato il link di cancellazione, mandato dal redirect di chi gestisce
 * davvero la rimozione (oggi n8n, vedi [emails/README.md](../../../emails/README.md)).
 * La pagina non cancella niente — è solo la conferma — quindi va raggiunta
 * *dopo* che la rimozione è andata a buon fine.
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
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 max-w-3xl w-full flex-col items-center justify-center align-middle p-16 bg-white dark:bg-black sm:items-start">
        <Logo iconOnly={true} />

        <div className="mt-10 w-full">
          <div className="flex items-start gap-3">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-zinc-400 dark:text-zinc-500"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM6.75 9.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h1 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Iscrizione cancellata
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {confirmed ? (
                  <>
                    Abbiamo tolto{" "}
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {confirmed}
                    </span>{" "}
                    dalla wishlist di Rysonance. Non ti scriveremo più.
                  </>
                ) : (
                  <>
                    Abbiamo tolto il tuo indirizzo dalla wishlist di Rysonance.
                    Non ti scriveremo più.
                  </>
                )}
              </p>
              <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                Se è stato un errore, o se cambi idea,{" "}
                <Link
                  href="/wishlist"
                  className="font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:text-zinc-100 dark:hover:text-zinc-300 dark:focus:ring-zinc-100 dark:focus:ring-offset-black"
                >
                  puoi rimetterti in lista
                </Link>{" "}
                quando vuoi.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
