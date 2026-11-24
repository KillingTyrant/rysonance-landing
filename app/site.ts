/**
 * I dati del sito che servono a più file: metadata (`layout.tsx`),
 * `robots.ts`, `sitemap.ts`, i dati strutturati della landing e `llms.txt`.
 *
 * Il dominio è quello di produzione, non l'URL del singolo deploy
 * (VERCEL_URL, che resta solo come ripiego): serve ai link assoluti.
 */
const productionHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

export const SITE_URL = productionHost
  ? `https://${productionHost}`
  : "http://localhost:3000";

export const SITE_NAME = "Rysonance";

/**
 * Titolo e descrizione per Google e per le anteprime dei link. Il titolo dice
 * che le avventure di ogni giocatore sono connesse a quelle degli altri, col
 * nome davanti, e si vede intero nei risultati di Google: 559px in Arial a
 * 20px, sotto i circa 580px oltre i quali Google lo taglia con «…» (conta la
 * larghezza, non i caratteri). La descrizione resta sotto i 160 caratteri.
 * Se si cambia il titolo, va rimisurato.
 */
export const SITE_TITLE =
  "Rysonance — Il gioco di ruolo dove ogni avventura è connessa";

export const SITE_DESCRIPTION =
  "Vuoi iniziare a giocare di ruolo da tavolo? Rysonance è il GdR facile e intuitivo, con un’esperienza digitale che connette il tuo party a un mondo condiviso.";

/** La frase del sito, quella dell'intestazione della landing. */
export const SITE_SUMMARY =
  "Rysonance è il gioco di ruolo da tavolo che abbatte le barriere di ingresso con un’esperienza digitale facile, profonda ed intuitiva. Che tu sia un principiante o un veterano, puoi vivere un’avventura in un gioco connesso dove le tue azioni e quelle dei tuoi amici influenzano il mondo di gioco.";
