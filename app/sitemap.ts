import type { MetadataRoute } from "next";
import { SITE_URL } from "./site";

/**
 * `sitemap.xml`: la landing. `/wishlist` non c'è di proposito: è lo stesso
 * form della landing, e in Google farebbe concorrenza alla home.
 *
 * `use cache`: con i Cache Components una data letta durante la preparazione
 * renderebbe la sitemap da calcolare a ogni richiesta; così si prepara una
 * volta e `lastModified` è il momento della build, come prima.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
