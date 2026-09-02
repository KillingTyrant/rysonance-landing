"use server";

import { redirect } from "next/navigation";
import { isValidEmail, normalizeEmail, sendWelcomeEmail } from "./email";

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

  if (!email) {
    redirect("/wishlist?error=empty");
  }

  if (!isValidEmail(email)) {
    // L'indirizzo torna nell'URL per ripopolare l'input: senza JS il valore
    // digitato andrebbe altrimenti perso a ogni errore.
    redirect(`/wishlist?${new URLSearchParams({ error: "invalid", email })}`);
  }

  // Il webhook n8n è al momento l'unico posto dove l'iscrizione finisce: se non
  // risponde non c'è niente da confermare, quindi l'errore si vede invece di
  // mostrare una conferma falsa. `redirect` sta nel `catch`, cioè fuori dal
  // `try`: lancia per interrompere l'action e verrebbe scambiato per un errore.
  try {
    await sendWelcomeEmail(email);
  } catch (error) {
    // Nei log l'errore per intero (status e risposta di n8n), nell'URL solo il
    // codice: il dettaglio non riguarda chi si sta iscrivendo.
    console.error(`[wishlist] invio fallito per ${email}`, error);
    redirect(`/wishlist?${new URLSearchParams({ error: "send", email })}`);
  }

  redirect(`/wishlist?${new URLSearchParams({ joined: email })}`);
}
