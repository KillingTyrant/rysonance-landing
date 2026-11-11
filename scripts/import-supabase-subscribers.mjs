/**
 * Una tantum: porta su Mailchimp gli iscritti che stavano su Supabase, con la
 * prova del consenso (IP e ora dell'iscrizione) e l'attribuzione come tag.
 * Dopo, il progetto Supabase si può cancellare senza perdere niente; prima,
 * no: per chi si è iscritto finora, la prova del consenso sta solo lì.
 *
 * L'input è il CSV di questa query, scaricato dall'SQL editor di Supabase:
 *
 *   select email, consent_at, consent_ip,
 *          referrer, utm_source, utm_medium, utm_campaign
 *     from wishlist_subscribers
 *     where status = 'subscribed'
 *     order by consent_at;
 *
 * Uso (prima a vuoto, poi davvero):
 *
 *   node --env-file=.env.local scripts/import-supabase-subscribers.mjs iscritti.csv --dry-run
 *   node --env-file=.env.local scripts/import-supabase-subscribers.mjs iscritti.csv
 *
 * Va lanciato PRIMA di attivare l'automazione di benvenuto: un contatto
 * aggiunto via API conta come ingresso in lista, e questi il benvenuto
 * l'hanno già ricevuto da n8n.
 *
 * Chi è già su Mailchimp, in qualunque stato, si salta: se nel frattempo si è
 * disiscritto resta disiscritto, e se si è iscritto di nuovo dal form il suo
 * consenso più recente non viene sovrascritto da quello vecchio. Quindi
 * rilanciarlo è sicuro.
 *
 * Il CSV contiene dati personali: non va committato, e va cancellato quando
 * l'import è finito.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const [file, flag] = process.argv.slice(2);
const dryRun = flag === "--dry-run";

if (!file) {
  console.error(
    "uso: node --env-file=.env.local scripts/import-supabase-subscribers.mjs <file.csv> [--dry-run]",
  );
  process.exit(1);
}

const apiKey = process.env.MAILCHIMP_API_KEY;
const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
const datacenter = apiKey && /-([a-z]+\d+)$/.exec(apiKey)?.[1];

if (!apiKey || !audienceId || !datacenter) {
  console.error(
    "MAILCHIMP_API_KEY (con il datacenter in coda, `…-us21`) e MAILCHIMP_AUDIENCE_ID vanno configurati",
  );
  process.exit(1);
}

const base = `https://${datacenter}.api.mailchimp.com/3.0`;
const auth = `Basic ${Buffer.from(`rysonance-import:${apiKey}`).toString("base64")}`;

/** CSV con i campi fra virgolette quando serve, come lo esporta Supabase. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }

  row.push(field);
  if (row.some((value) => value !== "")) rows.push(row);

  const [header, ...data] = rows;
  return data.map((values) =>
    Object.fromEntries(header.map((name, i) => [name.trim(), values[i] ?? ""])),
  );
}

/**
 * `timestamptz` esce da Postgres come `2026-09-03 10:12:33.123456+00`, che
 * `Date` non legge in modo affidabile: lo si porta a ISO prima di parsarlo.
 */
function toIso(value) {
  if (!value) return null;

  const normalized = value
    .trim()
    .replace(" ", "T")
    .replace(/(\.\d{3})\d+/, "$1")
    .replace(/([+-]\d{2})$/, "$1:00");
  const date = new Date(normalized);

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString().replace(/\.\d{3}Z$/, "+00:00");
}

/** Stesso formato di `attributionTags` in app/wishlist/attribution.ts. */
function tagsOf(row) {
  const tags = [];

  try {
    if (row.referrer) tags.push(`referrer:${new URL(row.referrer).host}`);
  } catch {
    // Un referrer che non è una URL non è una sorgente.
  }

  for (const field of ["utm_source", "utm_medium", "utm_campaign"]) {
    if (row[field]) tags.push(`${field}:${row[field]}`);
  }

  return tags.map((tag) => tag.slice(0, 100));
}

async function call(method, path, body) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: auth,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10_000),
  });

  if (res.status === 404 && method === "GET") return null;
  if (!res.ok) {
    const problem = await res.json().catch(() => ({}));
    throw new Error(`${res.status} ${problem.title ?? ""}: ${problem.detail ?? ""}`);
  }

  return res.status === 204 ? {} : res.json();
}

const rows = parseCsv(readFileSync(file, "utf8"));
const counts = { added: 0, skipped: 0, failed: 0 };

for (const row of rows) {
  const email = row.email?.trim().toLowerCase();
  if (!email) continue;

  const hash = createHash("md5").update(email).digest("hex");
  const path = `/lists/${audienceId}/members/${hash}`;

  try {
    const existing = await call("GET", `${path}?fields=status`);
    if (existing) {
      console.log(`salto     ${email} (già su Mailchimp: ${existing.status})`);
      counts.skipped++;
      continue;
    }

    const member = {
      email_address: email,
      status_if_new: "subscribed",
      ...(row.consent_ip ? { ip_signup: row.consent_ip } : {}),
      ...(toIso(row.consent_at) ? { timestamp_signup: toIso(row.consent_at) } : {}),
    };
    const tags = tagsOf(row);

    if (dryRun) {
      console.log(`aggiungerei ${email}`, JSON.stringify({ ...member, tags }));
      counts.added++;
      continue;
    }

    await call("PUT", path, member);
    if (tags.length > 0) {
      await call("POST", `${path}/tags`, {
        tags: tags.map((name) => ({ name, status: "active" })),
      });
    }

    console.log(`aggiunto  ${email}`);
    counts.added++;
  } catch (error) {
    console.error(`fallito   ${email}: ${error.message}`);
    counts.failed++;
  }
}

console.log(
  `\n${dryRun ? "[prova a vuoto] " : ""}aggiunti ${counts.added}, saltati ${counts.skipped}, falliti ${counts.failed}`,
);
process.exit(counts.failed > 0 ? 1 : 0);
