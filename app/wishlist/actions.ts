"use server";

import { redirect } from "next/navigation";
import {
  attributionFromForm,
  attributionParams,
  attributionTags,
  type Attribution,
} from "./attribution";
import { readConsentIp } from "./consent";
import { isValidEmail, normalizeEmail } from "./email";
import {
  CONSENT_FIELD,
  HONEYPOT_FIELD,
  ORIGIN_FIELD,
  formAnchor,
  originPath,
  readOrigin,
  type FormOrigin,
} from "./form";
import { subscribe, type MailchimpOutcome } from "./mailchimp";

/**
 * POST-redirect-GET: l'action non ritorna nulla al client, redirige sulla
 * pagina da cui è partito il form (la landing o `/wishlist`, vedi
 * `ORIGIN_FIELD`) con l'esito negli searchParams e l'ancora del form. Così l'intera UI resta
 * server-side — nessun `"use client"`, nessun `useActionState` — e un reload
 * non ri-invia il form.
 *
 * Nell'URL passa un codice (`empty`, `invalid`), non il testo dell'errore: la
 * copy resta nella pagina, e chi si costruisce una query a mano non può
 * scriversi un messaggio a piacere.
 */
export async function joinWishlist(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const attribution = attributionFromForm(formData);
  const origin = readOrigin(formData.get(ORIGIN_FIELD));

  // Il campo esca è invisibile e fuori dall'ordine di tabulazione: un browser
  // non lo compila, un bot che riempie ogni input sì. Si finge la conferma
  // invece di mostrare un errore — un errore è un invito a riprovare, e chi
  // riprova indovina che c'è una trappola. Niente scritture, niente mail.
  if (formData.get(HONEYPOT_FIELD)) {
    console.warn(`[wishlist] honeypot compilato, iscrizione scartata`);
    done(origin, email);
  }

  if (!email) {
    back(origin, { error: "empty" }, attribution);
  }

  if (!isValidEmail(email)) {
    // L'indirizzo torna nell'URL per ripopolare l'input: senza JS il valore
    // digitato andrebbe altrimenti perso a ogni errore.
    back(origin, { error: "invalid", email }, attribution);
  }

  // Una casella non spuntata non arriva proprio nel FormData. Il controllo sta
  // prima del database: senza consenso non c'è niente da registrare.
  if (formData.get(CONSENT_FIELD) !== "on") {
    back(origin, { error: "consent", email }, attribution);
  }

  // Mailchimp è l'unico posto in cui l'iscrizione esiste: se non la prende non
  // c'è niente da confermare, e l'errore si vede invece di mostrare una
  // conferma falsa. Il benvenuto lo manda lui, all'ingresso in lista: da qui
  // non parte nessuna mail. `redirect` sta fuori dal `try`: lancia per
  // interrompere l'action e verrebbe scambiato per un errore.
  let outcome: MailchimpOutcome | null = null;
  try {
    outcome = await subscribe(email, {
      ip: await readConsentIp(),
      tags: attributionTags(attribution),
    });
  } catch (error) {
    // Nei log l'errore per intero (chiave rifiutata, timeout), nell'URL solo
    // il codice: il dettaglio non riguarda chi si sta iscrivendo.
    console.error(`[wishlist] iscrizione fallita per ${email}`, error);
  }

  if (!outcome) {
    back(origin, { error: "save", email }, attribution);
  }

  // Mailchimp scarta gli indirizzi che giudica finti, anche quando passano la
  // regex: per chi si iscrive è un indirizzo non valido, non un guasto nostro.
  if (outcome === "rejected") {
    back(origin, { error: "invalid", email }, attribution);
  }

  done(origin, email);
}

/**
 * L'URL di ritorno: la pagina del form, l'esito in query e l'ancora del form
 * in coda, così la pagina riparte da lì e non dall'inizio.
 */
function destination(origin: FormOrigin, query: URLSearchParams): string {
  return `${originPath(origin)}?${query}#${formAnchor(origin)}`;
}

/** Conferma: ogni form della pagina mostra che l'indirizzo è in lista. */
function done(origin: FormOrigin, email: string): never {
  redirect(destination(origin, new URLSearchParams({ joined: email })));
}

/**
 * Torna al form con l'esito, riportandosi dietro l'attribuzione: senza, un
 * indirizzo sbagliato al primo tentativo cancellerebbe gli `utm_*` dalla query
 * e il secondo invio — quello che va a buon fine — risulterebbe arrivato dal
 * nulla. Il tipo di ritorno è `never` perché `redirect` lancia: serve a
 * TypeScript per sapere che dopo la chiamata non si prosegue.
 */
function back(
  origin: FormOrigin,
  outcome: Record<string, string>,
  attribution: Attribution,
): never {
  const query = new URLSearchParams({
    ...outcome,
    // Quale form ha dato l'errore: l'ancora non arriva al server, questo sì.
    form: origin,
    ...attributionParams(attribution),
  });

  redirect(destination(origin, query));
}
