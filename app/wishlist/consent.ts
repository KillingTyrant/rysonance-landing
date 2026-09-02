/**
 * Cosa allegare all'iscrizione come prova del consenso: da quale indirizzo IP
 * e con quale browser è stato prestato (GDPR art. 7.1, «essere in grado di
 * dimostrare che l'interessato ha prestato il proprio consenso»). Insieme a
 * `consent_at` sulla riga, è quanto serve per rispondere a chi contesta di
 * essersi mai iscritto.
 *
 * Modulo a parte e non dentro `actions.ts` perché un file `"use server"`
 * esporta solo funzioni async — questo è vero anche per `readConsent`, ma
 * tenerlo qui separa la lettura della richiesta dalla logica dell'iscrizione.
 */
import { isIP } from "node:net";
import { headers } from "next/headers";

// Gli user agent lunghi esistono e non aggiungono niente: la colonna è `text`,
// ma una riga di log non deve poter diventare un paragrafo.
const USER_AGENT_MAX = 512;

// Un language tag ben formato non supera i 35 caratteri (RFC 5646).
const LOCALE_MAX = 35;

// `it-IT`, `en`, `pt-BR`: lettere e trattini, niente altro. Chi manda una
// stringa fuori forma sta scrivendo l'header a mano, e in tabella non ci va.
const LANGUAGE_TAG = /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i;

/**
 * `consent_ip` è una colonna `inet`: un valore malformato non viene troncato,
 * fa fallire l'intero insert — cioè perderebbe l'iscrizione per colpa di un
 * header. `isIP` di Node dice se è un IP vero (4 o 6); se non lo è, si scrive
 * null e l'iscrizione passa lo stesso.
 */
function clientIp(list: Headers): string | null {
  // `x-forwarded-for` è una catena `client, proxy1, proxy2`: il primo elemento
  // è chi ha originato la richiesta. `x-real-ip` è il fallback di chi mette un
  // nginx davanti. Entrambi sono header, quindi falsificabili da chi chiama
  // direttamente: valgono come indizio, non come prova d'identità.
  const forwarded = list.get("x-forwarded-for")?.split(",")[0]?.trim();
  const candidate = forwarded || list.get("x-real-ip")?.trim() || "";

  return isIP(candidate) ? candidate : null;
}

/**
 * `accept-language` è una lista con dei pesi — `it-IT,it;q=0.9,en;q=0.8` — e
 * la prima voce è la preferita. Si tiene solo quella: serve a decidere in che
 * lingua scrivere, non a ricostruire le preferenze linguistiche di nessuno.
 */
function preferredLocale(list: Headers): string | null {
  const tag = list.get("accept-language")?.split(",")[0]?.split(";")[0]?.trim();

  // `*` è il jolly di accept-language: vale "una qualsiasi", cioè niente.
  if (!tag || tag === "*" || !LANGUAGE_TAG.test(tag)) return null;

  return tag.slice(0, LOCALE_MAX);
}

export async function readConsent() {
  const list = await headers();

  return {
    ip: clientIp(list),
    userAgent: list.get("user-agent")?.slice(0, USER_AGENT_MAX) ?? null,
    locale: preferredLocale(list),
  };
}
