import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { LiveWishlistForm } from "@/components/live-wishlist-form";

export const metadata: Metadata = {
  title: "Iscriviti alla wishlist",
  description:
    "Iscriviti alla wishlist di Rysonance, il gioco di ruolo da tavolo facile per iniziare: ti invieremo un’email non appena sarà pronto.",
  alternates: { canonical: "/wishlist" },
};

/**
 * La pagina della sola iscrizione, per i link che puntano dritti al form.
 * Stesso form e stessa action della landing, con l'aspetto della sua
 * intestazione. Come la landing è pronta prima della visita, col form che
 * arriva dopo (vedi `LiveWishlistForm`).
 */
export default function Wishlist({ searchParams }: PageProps<"/wishlist">) {

  return (
    <main className="flex flex-1 flex-col bg-burgundy font-sans text-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-8 pb-10">
        <Link href="/" aria-label="Torna alla home di Rysonance" className="mx-auto">
          <Logo className="h-auto w-[14.25rem]" />
        </Link>

        <div className="my-auto py-12">
          <h1 className="text-center text-[1.9375rem] leading-[0.97] font-extrabold text-balance">
            Unisciti alla wishlist
          </h1>
          <p className="mt-4 text-center text-[0.9375rem] leading-snug text-white/80">
            Ti invieremo un’email non appena Rysonance sarà pronto.
          </p>
          <div className="mt-10">
            <LiveWishlistForm origin="wishlist" searchParams={searchParams} />
          </div>
        </div>
      </div>
    </main>
  );
}
