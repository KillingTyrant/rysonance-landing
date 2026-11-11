/**
 * Il nome del campo esca, condiviso fra la pagina che lo disegna e l'action
 * che lo controlla: se i due si scollassero, l'action smetterebbe di scartare
 * i bot senza che niente lo segnali.
 *
 * L'underscore serve: i browser riempiono da soli i campi che riconoscono
 * (`name`, `organization`, `url`), e un utente vero a cui l'autofill compila
 * l'esca verrebbe scartato in silenzio. Nessuna euristica di autofill guarda
 * un nome così.
 */
export const HONEYPOT_FIELD = "_gotcha";

/**
 * La casella del consenso. È `required` nel form, ma l'action la ricontrolla:
 * l'attributo lo rispetta il browser, non chi costruisce un POST a mano, e
 * un'iscrizione senza consenso esplicito non va registrata.
 */
export const CONSENT_FIELD = "consent";

/**
 * Quale form è stato inviato. La landing ne ha due, in cima e in fondo, e
 * l'esito (errore o conferma) deve tornare in quello che si è appena usato,
 * non in cima alla pagina.
 */
export const ORIGIN_FIELD = "_origin";

/**
 * Elenco chiuso dei form esistenti. Il valore arriva dal client e finisce in
 * un redirect: costruire l'URL su una stringa libera sarebbe un open
 * redirect, quindi ciò che non è in lista ricade su `/wishlist`.
 */
export const LANDING_FORMS = ["hero", "immagina"] as const;

export type FormOrigin = "wishlist" | (typeof LANDING_FORMS)[number];

export function readOrigin(value: unknown): FormOrigin {
  return (LANDING_FORMS as readonly unknown[]).includes(value)
    ? (value as FormOrigin)
    : "wishlist";
}

/** L'`id` del form nella pagina, che è anche l'ancora del redirect. */
export function formAnchor(origin: FormOrigin): string {
  return `iscriviti-${origin}`;
}

/** La pagina che ospita il form. */
export function originPath(origin: FormOrigin): string {
  return origin === "wishlist" ? "/wishlist" : "/";
}
