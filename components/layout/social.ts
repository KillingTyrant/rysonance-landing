/**
 * I profili social di Rysonance. Servono alla barra in alto (`navbar.tsx`),
 * ai dati strutturati della landing (`sameAs` dell'organizzazione, così Google
 * collega i profili al sito) e a `llms.txt`.
 *
 * Gli indirizzi sono quelli puliti, senza i parametri di tracciamento che
 * l'app di TikTok aggiunge quando si copia il link (`_r`, `_t`).
 * Discord non c'è ancora: nella barra l'icona dice «In arrivo».
 */
export const SOCIAL = {
  instagram: "https://www.instagram.com/rysonance.rpg/",
  tiktok: "https://www.tiktok.com/@rysonance_rpg",
} as const;
