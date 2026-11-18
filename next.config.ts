import type { NextConfig } from "next";

/**
 * Header di sicurezza su ogni risposta:
 *
 * - niente pagina dentro un iframe di altri siti (`frame-ancestors` e, per i
 *   browser vecchi, `X-Frame-Options`): il form della wishlist non deve poter
 *   essere mostrato sotto una pagina che inganna chi ci clicca. È l'unica
 *   regola della Content-Security-Policy: una policy completa dovrebbe
 *   elencare tutti i domini di iubenda, e va scritta con calma;
 * - `nosniff`: il browser usa il tipo dichiarato, non lo indovina;
 * - `Referrer-Policy`: agli altri siti arriva solo il nostro dominio, non
 *   l'URL intera con la query (dove dopo un invio c'è l'indirizzo email);
 * - `Permissions-Policy`: la pagina non usa fotocamera, microfono e
 *   posizione, e lo dice.
 */
const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // Senza, ogni risposta dice `X-Powered-By: Next.js`: un'informazione in
  // più per chi cerca le versioni vulnerabili, e a noi non serve.
  poweredByHeader: false,
  // AVIF dove il browser lo legge (circa il 20% più leggero del WebP a pari
  // qualità), WebP altrove. La prima richiesta di ogni immagine è più lenta
  // da preparare, poi resta in cache.
  images: { formats: ["image/avif", "image/webp"] },
  headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  redirects() {
    return [
      {
        // L'informativa è quella di iubenda: la pagina nostra non c'è più, e
        // `/privacy` resta solo perché qualche link vecchio (una mail, un
        // post) potrebbe ancora puntarci. Stesso URL di PRIVACY_POLICY_URL in
        // components/layout/iubenda.ts, che qui non si può importare.
        source: "/privacy",
        destination: "https://www.iubenda.com/privacy-policy/23677761",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
