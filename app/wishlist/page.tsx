import Link from "next/link";
import { Logo } from "@/components/logo";
import { WishlistForm } from "@/components/wishlist-form";
import { readAttribution } from "./attribution";
import { readOutcome } from "./outcome";

/**
 * La pagina della sola iscrizione, per i link che puntano dritti al form.
 * Stesso form e stessa action della landing, con l'aspetto della sua
 * intestazione.
 */
export default async function Wishlist({ searchParams }: PageProps<"/wishlist">) {
  const params = await searchParams;

  return (
    <main className="flex flex-1 flex-col bg-burgundy font-sans text-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-8 pb-10">
        <Link href="/" aria-label="Torna alla home di Rysonance" className="mx-auto">
          <Logo variant="wordmark" className="h-auto w-44" />
        </Link>

        <div className="my-auto py-12">
          <h1 className="text-center text-[1.9375rem] leading-[0.97] font-bold text-balance">
            Unisciti alla wishlist
          </h1>
          <p className="mt-4 text-center text-[0.9375rem] leading-snug text-white/80">
            Ti invieremo un’email non appena Rysonance sarà pronto.
          </p>
          <div className="mt-10">
            <WishlistForm
              origin="wishlist"
              tone="dark"
              outcome={readOutcome(params)}
              attribution={await readAttribution(params)}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
