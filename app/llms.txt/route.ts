import { FAQS } from "@/components/landing/faqs";
import { SOCIAL } from "@/components/layout/social";
import { SITE_SUMMARY, SITE_URL } from "../site";

/**
 * `/llms.txt`: la scheda del sito per gli assistenti e i motori di risposta
 * basati sull'IA (ChatGPT, Claude, Perplexity, le risposte di Google…), nel
 * formato proposto su llmstxt.org: un Markdown breve con cos'è il sito e i
 * link che contano. Solo fatti che sono già scritti sulla landing: se cambia
 * un testo lì, va cambiato anche qui. Generato alla build, col dominio di
 * produzione: non legge niente della singola richiesta, quindi con i Cache
 * Components si prepara da solo una volta e basta.
 */

export function GET() {
  const body = `# Rysonance

> ${SITE_SUMMARY}

Rysonance è un gioco di ruolo da tavolo (GdR) che abbatte le barriere di ingresso: è pensato principalmente per chi non ha mai giocato di ruolo e vorrebbe iniziare, e resta profondo per chi gioca da anni. Un'app nativa al sistema di gioco accompagna e guida i giocatori in ogni momento dell'avventura, senza dover studiare manuali e regole. È in pre-alpha: chi si iscrive alla wishlist entra in coda per le fasi di test e lo prova in anteprima.

## Come funziona

- **Il digitale al servizio dell'immaginazione**: si gioca al tavolo, con un sistema online che rende l'esperienza sia immaginativa che digitale.
- **Un mondo condiviso tra tutti i giocatori**: la tua avventura è connessa a quella di ogni altro giocatore; le azioni tue e dei tuoi amici influenzano il mondo di gioco.
- **Esperienza multipiattaforma**: si gioca al tavolo o online, su tablet, smartphone e computer.
- **Un sistema di gioco unico**, facile, profondo e intuitivo.
- **Gli Eco**: le azioni collettive di tutti i giocatori possono generare degli Eco nella trama magica. Il mondo di gioco viene influenzato dalle scelte di ognuno e risponde con variazioni di trama, regolamento o la generazione di nuove quest e oggetti.

## Domande frequenti

${FAQS.map((faq) => `### ${faq.question}\n\n${faq.answer}`).join("\n\n")}

## Link

- [Rysonance](${SITE_URL}/): la presentazione del gioco e l'iscrizione alla wishlist.
- [Wishlist](${SITE_URL}/wishlist): l'iscrizione per entrare in coda alle fasi di test.
- [Instagram](${SOCIAL.instagram}) e [TikTok](${SOCIAL.tiktok}): i profili di Rysonance. Discord è in arrivo.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
