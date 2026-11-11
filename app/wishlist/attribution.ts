/**
 * Da dove è arrivato chi si iscrive: il sito che l'ha mandato (`referrer`) e
 * la campagna (`utm_*`).
 *
 * Perché passano da campi hidden e non dagli header: la Server Action è un
 * POST che parte da /wishlist, quindi dentro l'action `referer` vale sempre
 * "/wishlist" — la sorgente vera si vede solo al render della pagina, un
 * passaggio prima. Gli UTM stessa storia: stanno nella query di quella prima
 * visita, e dopo il redirect non ci sarebbero più.
 *
 * Ne consegue che sono valori che arrivano dal client, falsificabili da
 * chiunque si costruisca una query o un POST a mano. Va bene: servono a sapere
 * quale post ha funzionato, non a decidere qualcosa.
 */
import { headers } from "next/headers";
import { first } from "./params";

export const ATTRIBUTION_FIELDS = [
  "referrer",
  "utm_source",
  "utm_medium",
  "utm_campaign",
] as const;

type Field = (typeof ATTRIBUTION_FIELDS)[number];

export type Attribution = Record<Field, string>;

// Un referrer è una URL e può essere lungo; gli utm_* sono etichette. Oltre,
// è qualcuno che sta provando a scrivere in tabella.
const LIMITS: Record<Field, number> = {
  referrer: 512,
  utm_source: 128,
  utm_medium: 128,
  utm_campaign: 128,
};

/**
 * Via i caratteri di controllo: finiscono in colonne che si rileggono nei log
 * e in un CSV esportato, dove un a-capo infilato qui dentro spezza la riga.
 */
function clean(value: string, max: number): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max);
}

/**
 * Solo i referrer esterni: chi passa dalla home alla wishlist non è una
 * sorgente ma una navigazione interna, e registrarla vorrebbe dire tenersi una
 * colonna piena del proprio dominio.
 */
function externalReferrer(list: Headers): string {
  const referer = list.get("referer");
  if (!referer) return "";

  try {
    return new URL(referer).host === list.get("host") ? "" : referer;
  } catch {
    // Un `referer` che non è una URL non arriva da un browser: si ignora.
    return "";
  }
}

/**
 * Letta dalla pagina, che la rimette nel form. `referrer` viene dagli header
 * alla prima visita; dopo un redirect d'errore è già nella query, e quello
 * negli header punterebbe ormai a noi stessi.
 */
export async function readAttribution(
  params: Record<string, string | string[] | undefined>,
): Promise<Attribution> {
  const list = await headers();

  const fromQuery = (field: Field) => clean(first(params[field]), LIMITS[field]);

  return {
    referrer: fromQuery("referrer") || clean(externalReferrer(list), LIMITS.referrer),
    utm_source: fromQuery("utm_source"),
    utm_medium: fromQuery("utm_medium"),
    utm_campaign: fromQuery("utm_campaign"),
  };
}

/** Letta dall'action dai campi hidden, con gli stessi limiti. */
export function attributionFromForm(formData: FormData): Attribution {
  const read = (field: Field) => {
    const value = formData.get(field);
    return typeof value === "string" ? clean(value, LIMITS[field]) : "";
  };

  return {
    referrer: read("referrer"),
    utm_source: read("utm_source"),
    utm_medium: read("utm_medium"),
    utm_campaign: read("utm_campaign"),
  };
}

// Il nome di un tag su Mailchimp ha un limite di lunghezza: oltre, il tag non
// si crea. Gli utm_* stanno già sotto i 128, il prefisso li può spingere oltre.
const TAG_MAX = 100;

/**
 * L'attribuzione come tag Mailchimp (`utm_source:instagram`): i tag si creano
 * da soli alla prima assegnazione, senza campi da configurare sull'audience, e
 * servono a fare segmenti per canale. Chi rientra da un altro post ne aggiunge
 * di nuovi senza perdere i vecchi.
 *
 * Del referrer si tiene solo il dominio: è «il sito che ti ha mandato qui»,
 * come dice l'informativa, e una URL intera si porta dietro query con
 * identificativi di tracciamento (`fbclid`, `gclid`) che non ci servono.
 */
export function attributionTags(attribution: Attribution): string[] {
  const tags: string[] = [];

  const host = referrerHost(attribution.referrer);
  if (host) tags.push(`referrer:${host}`);

  for (const field of ["utm_source", "utm_medium", "utm_campaign"] as const) {
    if (attribution[field]) tags.push(`${field}:${attribution[field]}`);
  }

  return tags.map((tag) => tag.slice(0, TAG_MAX));
}

function referrerHost(referrer: string): string {
  if (!referrer) return "";

  try {
    return new URL(referrer).host;
  } catch {
    // Arriva da un campo hidden: un valore che non è una URL l'ha scritto
    // qualcuno a mano, e non è una sorgente.
    return "";
  }
}

/** Solo i campi valorizzati, per rimetterli nella query di un redirect. */
export function attributionParams(
  attribution: Attribution,
): Record<string, string> {
  return Object.fromEntries(
    ATTRIBUTION_FIELDS.filter((field) => attribution[field]).map((field) => [
      field,
      attribution[field],
    ]),
  );
}
