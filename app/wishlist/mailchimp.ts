/**
 * Il client Mailchimp: la Marketing API v3, con `fetch` e basta.
 *
 * Mailchimp è l'unico posto in cui la wishlist esiste. Tiene l'audience, la
 * prova del consenso (IP e ora dell'iscrizione sulla scheda del contatto),
 * l'attribuzione (come tag) e manda le mail: il benvenuto parte da
 * un'automazione quando un contatto entra in lista, la disiscrizione la
 * gestisce il suo link `*|UNSUB|*`. L'app non conserva niente.
 *
 * Niente SDK (`@mailchimp/mailchimp_marketing`): per tre chiamate vorrebbe
 * dire una dipendenza in più da tenere aggiornata.
 */
import { createHash } from "node:crypto";

/**
 * Com'è finita l'iscrizione:
 *
 * - `subscribed`: in lista adesso, l'automazione di benvenuto parte da lì;
 * - `confirming`: Mailchimp gli ha mandato una mail di conferma e lo mette in
 *   lista solo dopo il clic (chi si era disiscritto, vedi `subscribe`);
 * - `already`: era già in lista (o in attesa di conferma), non si tocca niente;
 * - `rejected`: Mailchimp ha rifiutato l'indirizzo come non valido.
 */
export type MailchimpOutcome =
  | "subscribed"
  | "confirming"
  | "already"
  | "rejected";

/**
 * Gli errori di Mailchimp si riconoscono dal `title`, che è stabile; `detail`
 * è una frase per umani.
 *
 * Il primo è quello che arriva quando si prova a rimettere `subscribed` un
 * contatto che si è disiscritto (o è rimbalzato): via API non si può, il
 * consenso nuovo lo deve dare lui confermando una mail. Il secondo copre i
 * dati che Mailchimp scarta, fra cui gli indirizzi che giudica finti
 * (`test@test.com`).
 */
const COMPLIANCE_STATE = "Member In Compliance State";
const INVALID_RESOURCE = "Invalid Resource";

class MailchimpError extends Error {
  constructor(
    readonly status: number,
    readonly title: string,
    readonly detail: string,
  ) {
    super(`Mailchimp ${status} ${title}: ${detail}`);
  }
}

function config() {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;

  // Meglio fermarsi sulla configurazione mancante che sparare una richiesta
  // senza credenziali e ritrovarsi un 401 di cui non si capisce il motivo.
  if (!apiKey || !audienceId) {
    throw new Error(
      "mailchimp: MAILCHIMP_API_KEY o MAILCHIMP_AUDIENCE_ID non configurati",
    );
  }

  // La chiave finisce col datacenter dell'account (`…-us21`), che è anche
  // l'host a cui fare le chiamate: una chiave senza suffisso è incollata male.
  const datacenter = /-([a-z]+\d+)$/.exec(apiKey)?.[1];
  if (!datacenter) {
    throw new Error(
      "mailchimp: MAILCHIMP_API_KEY senza datacenter in coda (atteso `…-us21`)",
    );
  }

  return {
    apiKey,
    audienceId,
    base: `https://${datacenter}.api.mailchimp.com/3.0`,
  };
}

/** Mailchimp identifica un contatto con l'MD5 dell'indirizzo in minuscolo. */
function memberPath(audienceId: string, email: string): string {
  const hash = createHash("md5").update(email.toLowerCase()).digest("hex");
  return `/lists/${audienceId}/members/${hash}`;
}

/**
 * `null` per il 404 di una GET: «il contatto non c'è» non è un errore. Su
 * `PUT` e `POST` un 404 vuol dire che non c'è l'audience (un
 * `MAILCHIMP_AUDIENCE_ID` sbagliato), e deve fallire: preso per buono,
 * confermerebbe iscrizioni finite nel nulla.
 */
async function call(
  method: "GET" | "PUT" | "POST",
  path: string,
  body?: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  const { apiKey, base } = config();

  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      // Basic auth con la chiave come password: lo username Mailchimp lo
      // ignora, quindi ci si scrive chi chiama.
      Authorization: `Basic ${Buffer.from(`rysonance-landing:${apiKey}`).toString("base64")}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    // Senza timeout la Server Action resta appesa quanto ci mette Mailchimp a
    // rispondere, e chi si è iscritto guarda un form che gira.
    signal: AbortSignal.timeout(10_000),
  });

  if (res.status === 404 && method === "GET") return null;

  if (!res.ok) {
    // Gli errori sono un problem+json (`title`, `detail`): nei log va il
    // motivo, lo status da solo non dice cosa non andava.
    const problem = (await res.json().catch(() => ({}))) as {
      title?: unknown;
      detail?: unknown;
    };

    throw new MailchimpError(
      res.status,
      String(problem.title ?? ""),
      String(problem.detail ?? "").slice(0, 300),
    );
  }

  // 204 (i tag) non ha body.
  return res.status === 204 ? {} : ((await res.json()) as Record<string, unknown>);
}

/**
 * Iscrive chi ha compilato il form. È tutta qui la logica che prima stava
 * nell'upsert sul database:
 *
 * - indirizzo mai visto → in lista, tag di attribuzione;
 * - già in lista (o in attesa di conferma) → non si tocca niente. In
 *   particolare non si sovrascrive `ip_signup`: chiunque può scrivere
 *   l'indirizzo di un altro nel form, e la prova del consenso originale non
 *   deve poter essere rimpiazzata dall'IP di chi l'ha fatto;
 * - uscito (disiscritto, archiviato, rimbalzato) → rientra col consenso
 *   prestato adesso. Chi si era disiscritto Mailchimp non lo rimette
 *   `subscribed` via API: si ripete con `pending`, e Mailchimp gli manda la
 *   mail di conferma.
 *
 * Lo stato si legge prima con una GET invece di provare a creare e
 * interpretare l'errore: un 404 vuol dire «nuovo» senza ambiguità.
 */
export async function subscribe(
  email: string,
  { ip, tags }: { ip: string | null; tags: string[] },
): Promise<MailchimpOutcome> {
  const { audienceId } = config();
  const path = memberPath(audienceId, email);

  const existing = await call("GET", `${path}?fields=status`);
  if (existing?.status === "subscribed" || existing?.status === "pending") {
    return "already";
  }

  // L'IP è la prova del consenso: Mailchimp lo mostra sulla scheda del
  // contatto, accanto all'ora dell'iscrizione che registra da sé.
  const member = { email_address: email, ...(ip ? { ip_signup: ip } : {}) };

  let outcome: MailchimpOutcome;
  try {
    // `PUT` crea se non c'è e aggiorna se c'è: `status` vale per i contatti
    // esistenti, `status_if_new` per quelli nuovi.
    await call("PUT", path, {
      ...member,
      status: "subscribed",
      status_if_new: "subscribed",
    });
    outcome = "subscribed";
  } catch (error) {
    if (!(error instanceof MailchimpError)) throw error;

    if (error.title === INVALID_RESOURCE && /email/i.test(error.detail)) {
      return "rejected";
    }
    if (error.title !== COMPLIANCE_STATE) throw error;

    await call("PUT", path, {
      ...member,
      status: "pending",
      status_if_new: "pending",
    });
    outcome = "confirming";
  }

  await tag(path, tags, email);
  return outcome;
}

/**
 * I tag sono un di più: il contatto è già in lista, e se l'attribuzione non
 * si scrive l'iscrizione resta valida lo stesso. Farli fallire vorrebbe dire
 * mostrare un errore per un'etichetta.
 */
async function tag(path: string, tags: string[], email: string) {
  if (tags.length === 0) return;

  try {
    await call("POST", `${path}/tags`, {
      tags: tags.map((name) => ({ name, status: "active" })),
    });
  } catch (error) {
    console.error(`[mailchimp] tag non assegnati a ${email}`, error);
  }
}
