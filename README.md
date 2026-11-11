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

- `app/page.tsx` — la landing, nell'ordine dei layout: intestazione, «Esplora
  la nuova generazione», ESPLORA / Scatena gli Eco, IMMAGINA.
- `app/wishlist/` — la Server Action dell'iscrizione e la logica attorno
  (validazione, consenso, attribuzione delle campagne); `/wishlist` è la
  pagina della sola iscrizione.
- `components/wishlist-form.tsx` — il form, uguale in ogni sezione.
- `components/landing/` — le parole a tutta larghezza e le carte A/B/C.
- `assets/` — immagini dei layout e font del brand (Cabinet Grotesk, Sprat),
  caricati con `next/font/local`.
