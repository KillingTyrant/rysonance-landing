import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

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
 * Sprat Condensed Thin: le parole a tutta larghezza (ESPLORA, IMMAGINA).
 * Statico e non il variabile: SpratVF ha assi fuori standard (`wght` 10–200,
 * `wdth` 100–200), che `font-weight` e `font-stretch` non raggiungono, e
 * servirebbe pilotarli a mano con `font-variation-settings` per un solo stile.
 */
const sprat = localFont({
  src: "../assets/fonts/Sprat-CondensedThin.woff2",
  weight: "100",
  variable: "--font-sprat",
});

// Dominio di produzione, non l'URL del singolo deploy (VERCEL_URL): serve ai link assoluti dei metadata.
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const defaultUrl = productionHost ? `https://${productionHost}` : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Rysonance — Il gioco di ruolo da tavolo connesso",
  description:
    "Rysonance è il gioco di ruolo da tavolo in cui la tua avventura è connessa a quella di ogni altro giocatore tramite un sistema online che rende l'esperienza sia immaginativa che digitale.",
  // Icone: le genera Next dai file app/favicon.ico, app/icon.svg e app/apple-icon.tsx.
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
