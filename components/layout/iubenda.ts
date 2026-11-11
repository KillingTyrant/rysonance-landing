/**
 * La privacy e la cookie policy del sito: le genera e le tiene aggiornate
 * iubenda, e sono l'unica informativa. Non c'è una pagina nostra: `/privacy`
 * rimanda qui (vedi il redirect in next.config.ts, che riporta lo stesso URL
 * perché lì la risoluzione dei moduli è limitata e questo file non si importa).
 *
 * La policy su iubenda deve descrivere quello che la wishlist fa davvero:
 * Mailchimp come unico posto in cui stanno gli iscritti, con email, data e IP
 * dell'iscrizione ([consent.ts](../../app/wishlist/consent.ts)) e
 * l'attribuzione come tag ([attribution.ts](../../app/wishlist/attribution.ts)).
 * Se cambia quello che va a Mailchimp, la policy va aggiornata su iubenda.
 * Vale anche per le mail, che si scrivono su Mailchimp: il tracciamento di
 * aperture e clic lì è acceso di default, e va spento o dichiarato.
 */
export const PRIVACY_POLICY_URL =
  "https://www.iubenda.com/privacy-policy/23677761";

export const COOKIE_POLICY_URL = `${PRIVACY_POLICY_URL}/cookie-policy`;
