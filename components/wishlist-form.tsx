import { joinWishlist } from "@/app/wishlist/actions";
import { ATTRIBUTION_FIELDS, type Attribution } from "@/app/wishlist/attribution";
import {
  CONSENT_FIELD,
  HONEYPOT_FIELD,
  ORIGIN_FIELD,
  formAnchor,
  type FormOrigin,
} from "@/app/wishlist/form";
import type { Outcome } from "@/app/wishlist/outcome";
import { PRIVACY_POLICY_URL } from "./layout/iubenda";
import styles from "./wishlist-form.module.css";

/**
 * - `dark`: su bordeaux, inchiostro o carbone — campo traslucido, bottone oro;
 * - `light`: sul fondo chiaro — campo bianco, bottone inchiostro.
 *
 * Sul tono scuro il testo del bottone prende `--ticket-ink`, che la sezione
 * imposta al proprio colore di fondo (bordeaux nell'intestazione).
 */
type Tone = "dark" | "light";

const TONES = {
  dark: {
    input:
      "border-white/70 bg-white/15 text-white placeholder:text-white/55 focus:border-white focus:ring-white",
    button: styles.ticketGold,
    check: styles.checkOnDark,
    consent: "text-white/80",
    link: "hover:text-white",
    error: "text-gold",
    confirm: "border-white/25 bg-white/10 text-white",
    confirmIcon: "text-gold",
    confirmMuted: "text-white/75",
  },
  light: {
    input:
      "border-ink/60 bg-white text-ink placeholder:text-ink/60 focus:border-ink focus:ring-ink",
    button: styles.ticketInk,
    check: styles.checkOnLight,
    consent: "text-ink/80",
    link: "hover:text-ink",
    error: "text-red-700",
    confirm: "border-ink/15 bg-white text-ink",
    confirmIcon: "text-ink",
    confirmMuted: "text-ink/70",
  },
} as const;

/**
 * Il form della wishlist, uguale in ogni sezione della landing e su
 * `/wishlist`. Resta un Server Component: invio, errori e conferma passano
 * dalla Server Action e dalla query su cui redirige (vedi `actions.ts`), e
 * tutto funziona anche senza JavaScript.
 */
export function WishlistForm({
  origin,
  tone,
  outcome,
  attribution,
  className = "",
}: {
  origin: FormOrigin;
  tone: Tone;
  outcome: Outcome;
  attribution: Attribution;
  className?: string;
}) {
  const t = TONES[tone];
  const anchor = formAnchor(origin);

  if (outcome.joined) {
    return (
      <Confirmation
        id={anchor}
        email={outcome.joined}
        tone={tone}
        className={className}
      />
    );
  }

  // L'errore e l'indirizzo da ripopolare riguardano solo il form inviato.
  const mine = outcome.origin === origin;
  const error = mine ? outcome.error : "";
  const errorId = `${anchor}-error`;

  return (
    <form
      id={anchor}
      action={joinWishlist}
      className={`w-full scroll-mt-10 ${className}`}
    >
      <input type="hidden" name={ORIGIN_FIELD} value={origin} />

      {/*
        * Da dove arriva chi si iscrive. Sta qui e non negli header perché il
        * POST dell'action parte da questa pagina: letto di là, `referer`
        * direbbe sempre l'URL del form.
        */}
      {ATTRIBUTION_FIELDS.map((field) => (
        <input
          key={field}
          type="hidden"
          name={field}
          value={attribution[field]}
        />
      ))}

      <label htmlFor={`${anchor}-email`} className="sr-only">
        Indirizzo email
      </label>
      <input
        id={`${anchor}-email`}
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="bestplayer@mail.com"
        defaultValue={mine ? outcome.email : ""}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`block h-11 w-full rounded-[10px] border px-4 text-center text-[14px] transition-colors focus:outline-none focus:ring-1 ${t.input}`}
      />

      <button
        type="submit"
        className={`${styles.ticket} ${t.button} mt-5 flex h-11 w-full items-center justify-center px-8 text-[17px] font-bold`}
      >
        Iscriviti alla wishlist
      </button>

      {error && (
        <p
          id={errorId}
          role="alert"
          className={`mt-3 text-center text-sm font-medium ${t.error}`}
        >
          {error}
        </p>
      )}

      {/*
        * Il consenso è una casella da spuntare, non implicito nell'invio: per
        * l'invio di aggiornamenti serve un'azione esplicita (GDPR art. 7).
        * L'informativa sta qui, nel punto in cui si lascia l'indirizzo.
        */}
      <div className={`mt-5 flex items-start gap-3 text-xs leading-snug ${t.consent}`}>
        <input
          id={`${anchor}-consent`}
          name={CONSENT_FIELD}
          type="checkbox"
          required
          className={`${styles.check} ${t.check} mt-px`}
        />
        <p>
          <label htmlFor={`${anchor}-consent`} className="cursor-pointer">
            Iscrivendoti alla wishlist accetti di ricevere aggiornamenti sul
            mondo di gioco e i suoi sviluppi.
          </label>{" "}
          {/*
            * La policy iubenda, la stessa del footer. Le classi `iubenda-*`
            * fanno aprire allo script iubenda (in layout.tsx) la policy in
            * sovrimpressione, così il form resta com'è; `nostyle` lascia il
            * link com'è disegnato qui. Senza script si apre in una scheda
            * nuova, per non perdere l'indirizzo già scritto.
            * suppressHydrationWarning: lo script marca i link esterni prima
            * dell'idratazione.
            */}
          <a
            href={PRIVACY_POLICY_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Privacy Policy"
            className={`iubenda-nostyle iubenda-noiframe iubenda-embed underline underline-offset-2 ${t.link}`}
            suppressHydrationWarning
          >
            Informativa privacy
          </a>
        </p>
      </div>

      {/*
        * Campo esca: `type="text"` e non `hidden`, perché un bot che riempie
        * ogni input deve poterlo vedere. Sparisce con `sr-only` +
        * `aria-hidden`, resta fuori dalla tabulazione con `tabIndex={-1}`.
        * `autoComplete="off"` tiene alla larga l'autofill, che compilandolo
        * scarterebbe una persona vera.
        */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor={`${anchor}-${HONEYPOT_FIELD}`}>
          Non compilare questo campo
        </label>
        <input
          id={`${anchor}-${HONEYPOT_FIELD}`}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>
    </form>
  );
}

function Confirmation({
  id,
  email,
  tone,
  className,
}: {
  id: string;
  email: string;
  tone: Tone;
  className: string;
}) {
  const t = TONES[tone];

  return (
    <div
      id={id}
      role="status"
      className={`flex w-full scroll-mt-10 items-start gap-3 rounded-[10px] border p-4 text-left ${t.confirm} ${className}`}
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className={`mt-0.5 size-5 shrink-0 ${t.confirmIcon}`}
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
          clipRule="evenodd"
        />
      </svg>
      <div>
        <p className="font-bold">Sei nella wishlist</p>
        <p className={`mt-1 text-sm ${t.confirmMuted}`}>
          Ti scriveremo a <span className="font-semibold">{email}</span> non
          appena ci sarà qualcosa da condividere.
        </p>
      </div>
    </div>
  );
}
