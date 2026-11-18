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
  «Iscriviti» (`components/ticket-pill.tsx`).
- `components/logo.tsx` — il logo ufficiale (`offial_logo_white.eps`) in SVG,
  intero o a pezzi (simbolo, lettere).
- `components/wishlist-form.tsx` — il form, uguale in ogni sezione.
- `components/landing/slide-stack.tsx` — le sezioni che si impilano allo
  scroll: ognuna resta ferma e si rimpicciolisce mentre la successiva le
  scorre sopra. Sul telefono (sotto i 768px, `breakpoints.ts`) è spento.
- `components/landing/explore-section.tsx` — «Esplora»: ferma mentre si
  accendono le voci da tablet in su, carte in colonna sul telefono.
- `components/landing/hero-slider.tsx` — lo slider dei popoli: monta solo la
  tavola attiva e la prossima.
- `components/landing/display-word.tsx` — le parole a tutta larghezza
  (COMBATTI, IMMAGINA).
- `assets/` — immagini dei layout e font del brand (Cabinet Grotesk, Sprat),
  caricati con `next/font/local`.
