"use server";

import { redirect } from "next/navigation";
import {
  attributionFromForm,
  attributionParams,
  type Attribution,
} from "./attribution";
import { readConsent } from "./consent";
import { isValidEmail, normalizeEmail, sendWelcomeEmail } from "./email";
import { HONEYPOT_FIELD } from "./form";
import { markWelcomeFailed, markWelcomeSent, recordSignup } from "./subscribers";

/**
 * POST-redirect-GET: l'action non ritorna nulla al client, redirige sulla
 * stessa pagina con l'esito negli searchParams. Così l'intera UI resta
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

  // Il campo esca è invisibile e fuori dall'ordine di tabulazione: un browser
  // non lo compila, un bot che riempie ogni input sì. Si finge la conferma
  // invece di mostrare un errore — un errore è un invito a riprovare, e chi
  // riprova indovina che c'è una trappola. Niente scritture, niente mail.
  if (formData.get(HONEYPOT_FIELD)) {
    console.warn(`[wishlist] honeypot compilato, iscrizione scartata`);
    redirect(`/wishlist?${new URLSearchParams({ joined: email })}`);
  }

  if (!email) {
    back({ error: "empty" }, attribution);
  }

  if (!isValidEmail(email)) {
    // L'indirizzo torna nell'URL per ripopolare l'input: senza JS il valore
    // digitato andrebbe altrimenti perso a ogni errore.
    back({ error: "invalid", email }, attribution);
  }

  // Prima il database, poi la mail. L'iscrizione è la cosa da non perdere: se il
  // database non la prende non c'è niente da confermare, e l'errore si vede
  // invece di mostrare una conferma falsa. `redirect` sta fuori dal `try`:
  // lancia per interrompere l'action e verrebbe scambiato per un errore.
  let signup = null;
  try {
    signup = await recordSignup(email, await readConsent(), attribution);
  } catch (error) {
    // Nei log l'errore per intero (vincolo violato, connessione rifiutata),
    // nell'URL solo il codice: il dettaglio non riguarda chi si sta iscrivendo.
    console.error(`[wishlist] salvataggio fallito per ${email}`, error);
  }

  if (!signup) {
    back({ error: "save", email }, attribution);
  }

  if (signup.sendWelcome) {
    await deliverWelcome(email, signup.id);
  }

  redirect(`/wishlist?${new URLSearchParams({ joined: email })}`);
}

/**
 * Torna al form con l'esito, riportandosi dietro l'attribuzione: senza, un
 * indirizzo sbagliato al primo tentativo cancellerebbe gli `utm_*` dalla query
 * e il secondo invio — quello che va a buon fine — risulterebbe arrivato dal
 * nulla. Il tipo di ritorno è `never` perché `redirect` lancia: serve a
 * TypeScript per sapere che dopo la chiamata non si prosegue.
 */
function back(
  outcome: Record<string, string>,
  attribution: Attribution,
): never {
  const query = new URLSearchParams({
    ...outcome,
    ...attributionParams(attribution),
  });

  redirect(`/wishlist?${query}`);
}

/**
 * L'esito dell'invio è una colonna sulla riga, non un errore in faccia a chi
 * si è iscritto: l'iscrizione è già registrata, quindi la conferma è vera
 * anche se il benvenuto non parte. Quello che resta è `welcome_status`, da cui
 * si ricava cosa riprovare.
 *
 * Nessuna delle due scritture di stato può far fallire l'iscrizione, per cui
 * qui non si rilancia mai: al massimo la riga resta `pending` con la mail
 * partita, che è il modo meno dannoso di sbagliare (si rimanda un benvenuto,
 * non si perde un iscritto).
 */
async function deliverWelcome(email: string, subscriberId: string) {
  try {
    await sendWelcomeEmail(email);
  } catch (error) {
    console.error(`[wishlist] invio fallito per ${email}`, error);
    await markWelcomeFailed(subscriberId, error).catch((dbError) =>
      console.error(
        `[wishlist] stato invio non aggiornato per ${email}`,
        dbError,
      ),
    );
    return;
  }

  await markWelcomeSent(subscriberId).catch((dbError) =>
    console.error(`[wishlist] stato invio non aggiornato per ${email}`, dbError),
  );
}
