# Rysonance — landing

La landing di Rysonance, il gioco di ruolo da tavolo connesso, con l'iscrizione
alla wishlist. Next.js (App Router) e Tailwind CSS 4.

## Sviluppo

```bash
npm install
npm run dev
```

La pagina è su [http://localhost:3000](http://localhost:3000). Le variabili
d'ambiente necessarie sono elencate, con i commenti, in `.env.example`: vanno
copiate in `.env.local`.

## Dove sta cosa

- `app/page.tsx` — la landing, in tre sezioni: intestazione (slider dei
  popoli), «Esplora» + Scatena gli Eco (una sezione sola: il Void Monster a
  tutta larghezza parte da «Esplora» e scende fino agli Eco), iscrizione.
- `app/wishlist/` — la Server Action dell'iscrizione e la logica attorno
  (validazione, consenso, attribuzione delle campagne); `/wishlist` è la
  pagina della sola iscrizione.
- `components/layout/navbar.tsx` — la barra fissa in alto: scorrendo le
  lettere del logo si ritirano, resta il simbolo e sale, in alto a destra, il bottone
  «Iscriviti» (`components/ticket-pill.tsx`); appena è arrivato, al centro,
  le icone social (`social-icons.tsx`: Instagram e TikTok aprono i
  profili, Discord trema e dice «In arrivo»). Gli indirizzi dei profili sono in
  `components/layout/social.ts`, usati anche dai dati strutturati e da
  `llms.txt`.
- `components/logo.tsx` — il logo ufficiale (`offial_logo_white.eps`) in SVG,
  intero o a pezzi (simbolo, lettere).
- `components/wishlist-form.tsx` — il form, uguale in ogni sezione.
- `components/live-wishlist-form.tsx` — il form dentro le pagine servite già
  pronte: con i Cache Components (`cacheComponents` in `next.config.ts`) la
  landing e `/wishlist` si preparano alla build e Vercel le manda dalla sua
  rete; solo i form, che leggono l'esito dell'iscrizione e l'attribuzione
  (query e `referer`), arrivano subito dopo nella stessa risposta, al posto
  dello stesso form vuoto. Senza JavaScript ci si iscrive lo stesso, ma esito
  ed errori dopo l'invio non si vedono.
- `components/landing/slide-stack.tsx` — le sezioni che si impilano allo
  scroll: ognuna resta ferma e si rimpicciolisce mentre la successiva le
  scorre sopra. Sul telefono (sotto i 768px, `breakpoints.ts`) è spento.
- `components/landing/explore-section.tsx` — «Esplora»: ferma mentre si
  accendono le voci da tablet in su (la voce accesa diventa oro e più grande,
  l'immagine nel box cambia in dissolvenza), carte in colonna sul telefono. Le immagini sono in `assets/landing/esplora-*.webp`:
  il box prende le proporzioni di `esplora-immaginazione.webp` (oggi
  1080×1382), quindi le altre vanno esportate con le stesse. Dentro gli
  schermi solo arte di Rysonance: le immagini di prova dell'app non sono
  nostre e vanno sostituite prima di fotografarla.
- `components/landing/hero-slider.tsx` — lo slider dei popoli: monta solo la
  tavola attiva e la prossima.
- `components/landing/display-word.tsx` — le parole a tutta larghezza
  (COMBATTI, IMMAGINA).
- `components/landing/round-link.tsx` — il bottone piccolo e tondo coi
  pallini: «Scopri di più» degli Eco, che scende morbido all'iscrizione in
  fondo (`#iscriviti`).
- `components/landing/awakening-title.tsx` — la frase sul Void Monster («Il
  mondo ha bisogno del tuo risveglio»): compare allo scroll, col mouse le
  lettere fanno l'onda.
- `components/landing/faqs.ts` — le domande frequenti: le mostra
  `faq-section.tsx` (le tendine animate) e finiscono anche nei dati
  strutturati e in `llms.txt`.
- `assets/` — immagini dei layout e font del brand (Cabinet Grotesk, Sprat),
  caricati con `next/font/local`.
- SEO e risposte delle IA: titolo, descrizione e dominio in `app/site.ts`;
  `app/robots.ts`, `app/sitemap.ts`, `app/llms.txt/route.ts` (la scheda del
  sito per gli assistenti come ChatGPT e Perplexity) e i dati strutturati
  (schema.org) in `app/page.tsx`. Se cambiano i testi della landing, vanno
  aggiornati anche lì.
- `app/opengraph-image.jpg` — l'anteprima dei link condivisi, 1200×630 e sotto
  i 300 KB (oltre, WhatsApp non la mostra). È un'immagine fissa: se cambia il
  titolo va rifatta.
