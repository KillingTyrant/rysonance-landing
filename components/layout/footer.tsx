import Link from "next/link";
import { Logo } from "@/components/logo";
import { COOKIE_POLICY_URL, PRIVACY_POLICY_URL } from "./iubenda";

/**
 * Il footer di tutte le pagine, sul carbone della landing: marchio, wishlist e
 * la privacy e cookie policy iubenda di questo sito.
 *
 * Le classi `iubenda-*` sui due link sono quelle dell'embed: lo script
 * iubenda (in layout.tsx) le intercetta e apre la policy in sovrimpressione.
 */
export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-coal font-sans text-white/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-8 text-xs sm:flex-row sm:justify-between lg:px-10">
        <Link href="/" aria-label="Rysonance, torna alla home">
          <Logo variant="full" animated={false} className="h-5 w-auto text-white" />
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <p>© 2026 Rysonance. Tutti i diritti riservati.</p>
          <Link
            href="/wishlist"
            className="underline underline-offset-2 hover:text-white"
          >
            Wishlist
          </Link>
          {/* suppressHydrationWarning: il widget iubenda in <head> modifica questi link
              (es. data-cmp-ab) prima dell'idratazione. */}
          <a
            href={PRIVACY_POLICY_URL}
            className="iubenda-white iubenda-noiframe iubenda-embed hover:underline"
            title="Privacy Policy"
            suppressHydrationWarning
          >
            Privacy Policy
          </a>
          <a
            href={COOKIE_POLICY_URL}
            className="iubenda-white iubenda-noiframe iubenda-embed hover:underline"
            title="Cookie Policy"
            suppressHydrationWarning
          >
            Cookie Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
