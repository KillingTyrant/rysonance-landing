"use server";

import { redirect } from "next/navigation";
import { isValidEmail, normalizeEmail } from "./email";

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

  // TODO: persistere l'iscrizione (database o servizio di mailing list).
  // Finché non c'è uno storage configurato l'indirizzo non viene salvato da
  // nessuna parte: la schermata di conferma è vera solo a metà.
  console.log(`[wishlist] ${email}`);

  // `redirect` lancia per interrompere l'action: va tenuto fuori da try/catch.
  redirect(`/wishlist?${new URLSearchParams({ joined: email })}`);
}
