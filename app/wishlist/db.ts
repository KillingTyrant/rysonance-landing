/**
 * La connessione al database.
 *
 * Connessione diretta e non PostgREST perché lo schema è costruito attorno a
 * un ruolo dedicato (`wishlist_service`, vedi i grant e le policy nello
 * schema): via HTTP quel ruolo si raggiunge solo firmando un JWT col claim
 * `role` e concedendo il ruolo all'`authenticator`, mentre in SQL ci si
 * autentica *come* quel ruolo e basta. Le policy RLS valgono identiche: il
 * ruolo non ha `bypassrls`, quindi passa dalle stesse regole.
 */
import postgres from "postgres";

type Client = ReturnType<typeof postgres>;

/**
 * In sviluppo l'HMR rivaluta il modulo a ogni salvataggio. Senza tenere il
 * client su `globalThis` si aprirebbe un pool nuovo a ogni modifica, finché il
 * database smette di accettare connessioni. In produzione il modulo si valuta
 * una volta sola e il globale non fa differenza.
 */
const cache = globalThis as typeof globalThis & { wishlistDb?: Client };

/**
 * Pigra, non a livello di modulo: `next build` valuta i moduli mentre
 * raccoglie le pagine, e una connessione creata lì fallirebbe la build su una
 * macchina che non ha (e non deve avere) le credenziali di produzione.
 */
export function db(): Client {
  if (cache.wishlistDb) return cache.wishlistDb;

  const url = process.env.DATABASE_URL;

  // Come per n8n: meglio fermarsi sulla configurazione mancante che aprire una
  // connessione senza credenziali e leggere un errore che non dice il perché.
  if (!url) {
    throw new Error("db: DATABASE_URL non configurata");
  }

  cache.wishlistDb = postgres(url, {
    // Il pooler di Supabase in transaction mode assegna una connessione per
    // transazione, quindi un prepared statement preparato su una non esiste
    // sulla successiva. Con la connessione diretta è solo una micro-ottimizzazione
    // in meno; con il pooler, senza, le query falliscono.
    prepare: false,

    // Una connessione per istanza: in serverless ogni invocazione è un
    // processo a sé, e un pool grande moltiplicato per le istanze esaurisce i
    // posti del database.
    max: 1,

    // Senza timeout la Server Action resta appesa quanto ci mette il database
    // a rispondere, e chi si è iscritto guarda un form che gira.
    connect_timeout: 10,
    idle_timeout: 20,

    // I `notice` di Postgres non ci dicono niente e sporcano i log.
    onnotice: () => {},
  });

  return cache.wishlistDb;
}
