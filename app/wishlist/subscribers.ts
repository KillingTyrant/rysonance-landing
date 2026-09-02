/**
 * Le scritture sulla wishlist, in SQL diretto (vedi [db.ts](./db.ts) per il
 * perché della connessione invece di PostgREST).
 *
 * Tutto passa dal ruolo `wishlist_service`, che ha `select`, `insert` e
 * `update` e non ha `delete`: la cancellazione per richiesta GDPR resta
 * un'operazione manuale, non qualcosa che una Server Action può fare.
 */
import { attributionColumns, type Attribution } from "./attribution";
import { db } from "./db";

/** Ciò che l'action deve sapere dopo aver registrato l'iscrizione. */
export type Signup = {
  id: string;
  /**
   * Il benvenuto si manda solo a chi entra in lista adesso: prima iscrizione o
   * rientro dopo una cancellazione. Chi è già iscritto e reinvia il form vede
   * la conferma ma non riceve una seconda mail.
   */
  sendWelcome: boolean;
};

type Consent = {
  ip: string | null;
  userAgent: string | null;
  locale: string | null;
};

type UpsertRow = {
  id: string;
  inserted: boolean;
  written: boolean;
};

/**
 * Registra l'iscrizione in una sola istruzione. Tre casi:
 *
 * - indirizzo mai visto → riga nuova, benvenuto da mandare;
 * - indirizzo cancellato in passato → torna `subscribed`, benvenuto da mandare;
 * - indirizzo già iscritto → non si tocca niente e non si rimanda la mail.
 *
 * Il `where` sul `do update` è quello che distingue gli ultimi due: chi è già
 * iscritto non viene aggiornato, quindi non gli si sovrascrive il consenso
 * originale con uno nuovo. Ed è anche il motivo della `union`: quando il
 * `where` esclude la riga, la `returning` non torna niente, e l'id va comunque
 * recuperato per la conferma.
 *
 * `xmax = 0` è il modo di chiedere a Postgres se la riga è stata inserita o
 * aggiornata: su una riga appena inserita quel campo di sistema vale zero.
 */
export async function recordSignup(
  email: string,
  consent: Consent,
  attribution: Attribution,
): Promise<Signup> {
  const source = attributionColumns(attribution);

  const [row] = await db()<UpsertRow[]>`
    with upsert as (
      insert into wishlist_subscribers (
        email, source, consent_ip, consent_user_agent, locale,
        referrer, utm_source, utm_medium, utm_campaign
      )
      values (
        ${email}, 'landing', ${consent.ip}, ${consent.userAgent},
        ${consent.locale}, ${source.referrer}, ${source.utm_source},
        ${source.utm_medium}, ${source.utm_campaign}
      )
      on conflict (email) do update set
        status = 'subscribed',
        unsubscribed_at = null,
        -- Il rientro è un consenso nuovo, prestato adesso, e ha una sua
        -- provenienza: chi torna dopo mesi arriva da un altro post. Quello di
        -- prima non si perde, resta nell'evento di allora.
        consent_at = now(),
        consent_ip = excluded.consent_ip,
        consent_user_agent = excluded.consent_user_agent,
        locale = excluded.locale,
        referrer = excluded.referrer,
        utm_source = excluded.utm_source,
        utm_medium = excluded.utm_medium,
        utm_campaign = excluded.utm_campaign,
        welcome_status = 'pending',
        welcome_sent_at = null,
        welcome_error = null
      where wishlist_subscribers.status = 'unsubscribed'
      returning id, (xmax = 0) as inserted
    )
    select id, inserted, true as written from upsert
    union all
    select id, false, false
      from wishlist_subscribers
      where email = ${email} and not exists (select 1 from upsert)
  `;

  // Nessuna delle due branche ha prodotto una riga: non è un caso previsto —
  // o l'insert è stato scartato da una regola che non conosciamo, o la riga è
  // sparita nel frattempo. Meglio fallire che confermare a vuoto.
  if (!row) {
    throw new Error(`recordSignup: nessuna riga per ${email}`);
  }

  if (row.written) {
    await logEvent(row.id, row.inserted ? "signup" : "resubscribe", source);
  }

  return { id: row.id, sendWelcome: row.written };
}

export async function markWelcomeSent(subscriberId: string) {
  // `updated_at` non si scrive qui: ci pensa il trigger
  // wishlist_subscribers_touch_updated_at sul database.
  await db()`
    update wishlist_subscribers
      set welcome_status = 'sent',
          welcome_sent_at = now(),
          -- Un tentativo riuscito cancella il motivo di quello fallito prima:
          -- altrimenti resta un errore accanto a una mail partita.
          welcome_error = null
      where id = ${subscriberId}
  `;

  await logEvent(subscriberId, "welcome_sent");
}

export async function markWelcomeFailed(subscriberId: string, error: unknown) {
  const reason = (error instanceof Error ? error.message : String(error)).slice(
    0,
    500,
  );

  await db()`
    update wishlist_subscribers
      set welcome_status = 'failed',
          welcome_error = ${reason}
      where id = ${subscriberId}
  `;

  await logEvent(subscriberId, "welcome_failed", { error: reason });
}

/**
 * Fuori dalla transazione di chi la chiama, e con l'errore ingoiato: la storia
 * è un di più, e se un evento non si scrive l'iscrizione resta valida lo
 * stesso. Farlo risalire significherebbe mostrare un guasto per una riga di
 * archivio.
 */
async function logEvent(
  subscriberId: string,
  type: string,
  // Valori piatti e basta: `detail` è jsonb, ma quello che ci scriviamo sono
  // etichette (la sorgente, il motivo di un errore), non oggetti annidati.
  detail?: Record<string, string | null>,
) {
  try {
    await db()`
      insert into wishlist_events (subscriber_id, type, detail)
      values (${subscriberId}, ${type}, ${db().json(detail ?? null)})
    `;
  } catch (error) {
    console.error(
      `[wishlist] evento ${type} non registrato per ${subscriberId}`,
      error,
    );
  }
}
