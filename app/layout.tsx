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
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
        <footer className="mx-auto mt-8 mb-6 flex w-full max-w-5xl items-center justify-center gap-4 px-6 text-sm text-zinc-500">
          <a
            href="https://www.iubenda.com/privacy-policy/23677761"
            className="iubenda-white iubenda-noiframe iubenda-embed underline underline-offset-2 hover:text-zinc-900"
            title="Privacy Policy"
          >
            Privacy Policy
          </a>
          <span aria-hidden="true">|</span>
          <a
            href="https://www.iubenda.com/privacy-policy/23677761/cookie-policy"
            className="iubenda-white iubenda-noiframe iubenda-embed underline underline-offset-2 hover:text-zinc-900"
            title="Cookie Policy"
          >
            Cookie Policy
          </a>
        </footer>
        <Script
          id="iubenda-core"
          src="https://cdn.iubenda.com/iubenda.js"
          strategy="lazyOnload"
        />
        <Script
          id="iubenda-widget"
          src="https://embeds.iubenda.com/widgets/4ea21609-1c76-4e60-8134-efb44dfc2113.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
