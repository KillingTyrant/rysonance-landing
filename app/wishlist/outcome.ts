/**
 * L'esito di un invio, riletto dalla query su cui l'action ha rediretto. Sta
 * qui e non nelle pagine perché lo leggono sia la landing sia `/wishlist`.
 */
import { isValidEmail, normalizeEmail } from "./email";
import { readOrigin, type FormOrigin } from "./form";
import { first } from "./params";

/**
 * Nell'URL passa un codice, non il testo: la copy resta qui, e chi si
 * costruisce una query a mano non può scriversi un messaggio a piacere.
 */
const ERRORS: Record<string, string> = {
  empty: "Inserisci il tuo indirizzo email.",
  invalid: "Questo indirizzo email non sembra valido.",
  consent: "Per iscriverti spunta la casella qui sotto.",
  // Mailchimp non ha preso l'iscrizione (non risponde, o ha rifiutato la
  // richiesta per un motivo che non dipende dall'indirizzo): non c'è niente
  // di registrato, quindi riprovare è proprio quello che serve.
  save: "Qualcosa è andato storto da parte nostra. Riprova tra poco.",
};

export type Outcome = {
  /** Indirizzo appena iscritto: se c'è, ogni form mostra la conferma. */
  joined: string;
  /** Messaggio d'errore, da mostrare solo nel form `origin`. */
  error: string;
  /** Il form che ha dato l'errore. */
  origin: FormOrigin;
  /** L'indirizzo digitato, per ripopolare quel form. */
  email: string;
};

export function readOutcome(
  params: Record<string, string | string[] | undefined>,
): Outcome {
  // L'indirizzo arriva dall'URL, quindi lo si ri-valida prima di stamparlo:
  // la conferma deve poter mostrare solo un indirizzo plausibile, non una
  // stringa qualsiasi infilata nella query da chi passa di lì.
  const joined = normalizeEmail(first(params.joined));

  return {
    joined: isValidEmail(joined) ? joined : "",
    error: ERRORS[first(params.error)] ?? "",
    origin: readOrigin(first(params.form)),
    email: first(params.email).slice(0, 254),
  };
}
