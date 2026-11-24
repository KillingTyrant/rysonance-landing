import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Footer } from "@/components/layout/footer";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "./site";

/**
 * I font del brand, self-hosted da `assets/fonts` (next/font/local li serve
 * dal nostro dominio, con le metriche di fallback per evitare il salto).
 *
 * Cabinet Grotesk (ITF, Fontshare): titoli e testo. È variabile sull'asse
 * `wght` 100–900, quindi un solo file copre tutti i pesi.
 */
const cabinet = localFont({
  src: "../assets/fonts/CabinetGrotesk-Variable.woff2",
  weight: "100 900",
  variable: "--font-cabinet",
});

/**
 * Sprat Condensed, in due pesi statici: Thin (100) per le parole a tutta
 * larghezza (COMBATTI, IMMAGINA) e Light (300), un peso sopra, per la frase sul
 * Void Monster: lo Sprat più è piccolo più vuole peso, e la frase è molto più
 * piccola delle due parole. Ognuno lo chiede col suo `font-thin`/`font-light`:
 * senza, il peso normale (400) prenderebbe il Light.
 * Statici e non il variabile: SpratVF ha assi fuori standard (`wght` 10–200,
 * `wdth` 100–200), che `font-weight` e `font-stretch` non raggiungono, e
 * servirebbe pilotarli a mano con `font-variation-settings`.
 *
 * `preload: false`: stanno a metà e in fondo alla pagina, e non serve che
 * arrivino prima di quello che si legge subito. Il browser scarica ogni peso
 * solo quando un testo lo usa.
 */
const sprat = localFont({
  src: [
    { path: "../assets/fonts/Sprat-CondensedThin.woff2", weight: "100" },
    { path: "../assets/fonts/Sprat-CondensedLight.woff2", weight: "300" },
  ],
  variable: "--font-sprat",
  preload: false,
});

/**
 * Metadata di tutto il sito (titolo, descrizione e dominio in `site.ts`).
 * Le pagine aggiungono il loro indirizzo canonico (`alternates`), che qui
 * varrebbe per tutte. L'immagine per i social è `opengraph-image.jpg` (con la
 * descrizione in `opengraph-image.alt.txt`), le icone le genera Next dai file
 * app/favicon.ico, app/icon.svg e app/apple-icon.tsx.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // Google le ignora, altri motori le leggono ancora.
  keywords: [
    "gioco di ruolo da tavolo",
    "GdR",
    "come iniziare a giocare di ruolo",
    "giochi di ruolo per principianti",
    "gioco di ruolo online",
    "gioco di ruolo con app",
    "party",
    "Rysonance",
  ],
  category: "games",
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  // Anteprime grandi e testo intero: così Google (anche nelle risposte delle
  // ricerche con l'IA) può mostrare l'illustrazione e citare il testo per
  // intero. La pagina della cancellazione dalla wishlist dice di no per conto
  // suo.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  // La barra del browser su mobile prende il colore dell'intestazione.
  themeColor: "#3f0517",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="it"
      className={`${cabinet.variable} ${sprat.variable} h-full antialiased`}
    >
      <head>
        {/*
          * Il widget di iubenda (qui sotto) scarica a sua volta il banner dei
          * cookie da cdn.iubenda.com: aprendo subito la connessione, il banner
          * arriva un giro di rete prima (sulle connessioni lente è mezzo
          * secondo e più).
          */}
        <link rel="preconnect" href="https://cdn.iubenda.com" />
        {/* Snippet iubenda: deve essere un <script> sincrono nell'HTML del server, altrimenti la verifica
            di iubenda non lo trova e il blocco automatico non intercetta gli script caricati prima.
            Prima dell'idratazione il widget inserisce in <head> un altro <script> (core-it.js) senza
            async, che React abbina a questo: da qui suppressHydrationWarning. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          type="text/javascript"
          src="https://embeds.iubenda.com/widgets/4ea21609-1c76-4e60-8134-efb44dfc2113.js"
          suppressHydrationWarning
        />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <Footer />
        <Script
          id="iubenda-core"
          src="https://cdn.iubenda.com/iubenda.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
