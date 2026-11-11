import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
