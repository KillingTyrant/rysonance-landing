import type { MetadataRoute } from "next";
import { SITE_URL } from "./site";

/**
 * `robots.txt`: tutto il sito è aperto a tutti, motori di ricerca e crawler
 * delle IA compresi (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…): la
 * landing deve poter comparire anche nelle loro risposte. La pagina della
 * cancellazione dalla wishlist non va bloccata qui: ha il suo `noindex`, e un
 * crawler bloccato non lo leggerebbe.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
