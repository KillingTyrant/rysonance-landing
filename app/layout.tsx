import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Dominio di produzione, non l'URL del singolo deploy (VERCEL_URL): serve ai link assoluti dei metadata.
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const defaultUrl = productionHost ? `https://${productionHost}` : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Rysonance",
  description: "Rysonance RPG",
  // Icone: le genera Next dai file app/favicon.ico, app/icon.svg e app/apple-icon.tsx.
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="it"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
        <footer className="mx-auto mt-8 mb-6 flex w-full max-w-5xl items-center justify-center gap-4 px-6 text-sm text-zinc-500">
          {/* iubenda modifica questi link (es. data-cmp-ab) prima dell'idratazione. */}
          <a
            href="https://www.iubenda.com/privacy-policy/23677761"
            className="iubenda-white iubenda-noiframe iubenda-embed underline underline-offset-2 hover:text-zinc-900"
            title="Privacy Policy"
            suppressHydrationWarning
          >
            Privacy Policy
          </a>
          <span aria-hidden="true">|</span>
          <a
            href="https://www.iubenda.com/privacy-policy/23677761/cookie-policy"
            className="iubenda-white iubenda-noiframe iubenda-embed underline underline-offset-2 hover:text-zinc-900"
            title="Cookie Policy"
            suppressHydrationWarning
          >
            Cookie Policy
          </a>
        </footer>
        <Script
          id="iubenda-core"
          src="https://cdn.iubenda.com/iubenda.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
