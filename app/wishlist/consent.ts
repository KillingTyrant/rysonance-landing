/**
 * Cosa allegare all'iscrizione come prova del consenso: da quale indirizzo IP
 * è stato prestato (GDPR art. 7.1, «essere in grado di dimostrare che
 * l'interessato ha prestato il proprio consenso»). Va su Mailchimp come
 * `ip_signup`, accanto all'ora dell'iscrizione che Mailchimp registra da sé: è
 * quanto serve per rispondere a chi contesta di essersi mai iscritto.
 *
 * Browser (user agent) e lingua non si raccolgono più: Mailchimp non ha dove
 * tenerli, e un dato che non serve a niente è meglio non averlo.
 *
 * Modulo a parte e non dentro `actions.ts` perché un file `"use server"`
 * esporta solo funzioni async — questo è vero anche per `readConsentIp`, ma
 * tenerlo qui separa la lettura della richiesta dalla logica dell'iscrizione.
 */
import { isIP } from "node:net";
import { headers } from "next/headers";

/**
 * Solo un IP vero (4 o 6, lo dice `isIP` di Node): Mailchimp rifiuterebbe un
 * `ip_signup` malformato, e con lui l'intera iscrizione per colpa di un
 * header. Se non lo è si manda null e l'iscrizione passa lo stesso.
 */
export async function readConsentIp(): Promise<string | null> {
  const list = await headers();

  // `x-forwarded-for` è una catena `client, proxy1, proxy2`: il primo elemento
  // è chi ha originato la richiesta. `x-real-ip` è il fallback di chi mette un
  // nginx davanti. Entrambi sono header, quindi falsificabili da chi chiama
  // direttamente: valgono come indizio, non come prova d'identità.
  const forwarded = list.get("x-forwarded-for")?.split(",")[0]?.trim();
  const candidate = forwarded || list.get("x-real-ip")?.trim() || "";

  return isIP(candidate) ? candidate : null;
}
