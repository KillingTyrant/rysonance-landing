import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";

/**
 * Informativa privacy (GDPR art. 13), scritta sui dati che la wishlist
 * raccoglie davvero — vedi [supabase.ts](../wishlist/supabase.ts),
 * [consent.ts](../wishlist/consent.ts) e
 * [attribution.ts](../wishlist/attribution.ts). Se cambiano le colonne, questa
 * pagina va cambiata con loro: un'informativa che elenca dati diversi da
 * quelli trattati è peggio di nessuna informativa.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * DA COMPILARE PRIMA DI PUBBLICARE
 *
 * I valori qui sotto non sono deducibili dal codice e non possono essere
 * inventati: l'identità del titolare è un elemento obbligatorio, e la regione
 * di Supabase decide se c'è o no un trasferimento fuori dall'Unione. Sono
 * scritti fra virgolette basse apposta, così se restano vuoti si vedono sulla
 * pagina pubblicata invece di passare inosservati.
 * ─────────────────────────────────────────────────────────────────────────
 */
const TITOLARE = {
  nome: "«ragione sociale, o nome e cognome se persona fisica»",
  indirizzo: "«indirizzo completo della sede»",
  email: "«indirizzo email per le richieste privacy»",
};

// Project Settings → General → Region, sulla dashboard Supabase.
const REGIONE_DATABASE = "«regione del progetto Supabase, es. EU West (Ireland)»";

// Chi consegna materialmente le email: il servizio SMTP o transazionale
// configurato dentro n8n.
const PROVIDER_EMAIL = "«nome del servizio di invio email usato da n8n»";

const AGGIORNAMENTO = "2 settembre 2026";

export const metadata: Metadata = {
  title: "Informativa privacy — Rysonance",
  description:
    "Come Rysonance tratta i dati di chi si iscrive alla wishlist: quali dati, perché, per quanto e con quali diritti.",
};

export default function Privacy() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex max-w-3xl w-full flex-col p-16 bg-white dark:bg-black">
        <Logo iconOnly={true} />

        <h1 className="mt-10 text-2xl font-medium text-zinc-900 dark:text-zinc-100">
          Informativa privacy
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Ultimo aggiornamento: {AGGIORNAMENTO}
        </p>

        <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          Questa pagina riguarda un solo trattamento: la wishlist di Rysonance,
          cioè la lista di indirizzi a cui scriveremo quando il gioco sarà
          pronto. Non ci sono account, non ci sono cookie di profilazione e non
          c&apos;è nessuna piattaforma di analytics.
        </p>

        <Section title="Chi tratta i dati">
          <p>
            Il titolare del trattamento è {TITOLARE.nome}, {TITOLARE.indirizzo}.
            Per qualsiasi richiesta relativa ai tuoi dati puoi scrivere a{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {TITOLARE.email}
            </span>
            .
          </p>
        </Section>

        <Section title="Quali dati raccogliamo">
          <p>Quando ti iscrivi alla wishlist registriamo:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                Il tuo indirizzo email.
              </strong>{" "}
              È l&apos;unico dato che ci dai attivamente, e l&apos;unico senza
              il quale non possiamo avvisarti.
            </li>
            <li>
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                Data e ora dell&apos;iscrizione, indirizzo IP e browser
                (user agent).
              </strong>{" "}
              Servono a dimostrare che il consenso è stato prestato davvero, da
              qualcuno, in un certo momento. Non li usiamo per profilarti né per
              riconoscerti quando torni sul sito.
            </li>
            <li>
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                La lingua preferita del tuo browser.
              </strong>{" "}
              Solo per capire in che lingua scriverti.
            </li>
            <li>
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                Da dove sei arrivato:
              </strong>{" "}
              il sito che ti ha mandato qui e gli eventuali parametri di
              campagna nel link (<code>utm_source</code>, <code>utm_medium</code>
              , <code>utm_campaign</code>). Ci dicono quali canali funzionano,
              in forma aggregata; non ricostruiamo il tuo percorso di
              navigazione.
            </li>
          </ul>
          <p className="mt-3">
            Non raccogliamo il tuo nome, non ti chiediamo altro e non compriamo
            né arricchiamo questi dati da fonti esterne.
          </p>
        </Section>

        <Section title="Perché, e con quale base giuridica">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                Avvisarti al lancio</strong>{" "}
              — base giuridica: il tuo{" "}
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                consenso
              </strong>{" "}
              (art. 6.1.a GDPR), che presti iscrivendoti e puoi ritirare quando
              vuoi.
            </li>
            <li>
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                Poter dimostrare quel consenso</strong>{" "}
              (data, IP, browser) — base giuridica: il{" "}
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                legittimo interesse
              </strong>{" "}
              (art. 6.1.f) a rispondere a chi contesta di essersi iscritto, come
              richiesto dall&apos;art. 7.1.
            </li>
            <li>
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                Capire da quali canali arrivano le iscrizioni</strong>{" "}
              — base giuridica: il{" "}
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                legittimo interesse
              </strong>{" "}
              (art. 6.1.f) a non sprecare tempo e budget su canali che non
              funzionano. Puoi opporti a questo trattamento specifico senza
              perdere l&apos;iscrizione.
            </li>
          </ul>
          <p className="mt-3">
            Non prendiamo nessuna decisione automatizzata sul tuo conto e non
            facciamo profilazione.
          </p>
        </Section>

        <Section title="Per quanto tempo li teniamo">
          <p>
            Fino a quando ritiri il consenso, e comunque non oltre dodici mesi
            dal lancio di Rysonance o dall&apos;abbandono del progetto. Se ti
            cancelli, l&apos;indirizzo resta registrato come cancellato: serve a
            non riscriverti per errore, ed è a sua volta un dato che teniamo per
            questo solo motivo. Puoi comunque chiederne l&apos;eliminazione
            completa.
          </p>
        </Section>

        <Section title="Chi altro li vede">
          <p>
            Nessuno a cui non serva. I dati passano da alcuni fornitori che
            trattano i dati per nostro conto come responsabili (art. 28 GDPR):
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                Supabase
              </strong>{" "}
              — il database in cui la lista è conservata, ospitato nella regione{" "}
              {REGIONE_DATABASE}.
            </li>
            <li>
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                n8n
              </strong>{" "}
              — l&apos;automazione che prepara e fa partire le email.
            </li>
            <li>
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                {PROVIDER_EMAIL}
              </strong>{" "}
              — il servizio che consegna materialmente i messaggi.
            </li>
          </ul>
          <p className="mt-3">
            Non vendiamo, non cediamo e non scambiamo la lista con nessuno. Se
            un fornitore tratta i dati fuori dallo Spazio economico europeo, il
            trasferimento avviene sulla base delle clausole contrattuali tipo
            approvate dalla Commissione europea.
          </p>
        </Section>

        <Section title="I tuoi diritti">
          <p>
            Puoi chiederci in qualsiasi momento di{" "}
            <strong className="font-medium text-zinc-900 dark:text-zinc-100">
              accedere
            </strong>{" "}
            ai tuoi dati, di{" "}
            <strong className="font-medium text-zinc-900 dark:text-zinc-100">
              correggerli
            </strong>
            , di{" "}
            <strong className="font-medium text-zinc-900 dark:text-zinc-100">
              cancellarli
            </strong>
            , di{" "}
            <strong className="font-medium text-zinc-900 dark:text-zinc-100">
              limitarne
            </strong>{" "}
            il trattamento, di{" "}
            <strong className="font-medium text-zinc-900 dark:text-zinc-100">
              riceverli in un formato leggibile
            </strong>{" "}
            e di{" "}
            <strong className="font-medium text-zinc-900 dark:text-zinc-100">
              opporti
            </strong>{" "}
            ai trattamenti fondati sul legittimo interesse. Scrivi a{" "}
            {TITOLARE.email}: rispondiamo entro un mese.
          </p>
          <p className="mt-3">
            Puoi{" "}
            <strong className="font-medium text-zinc-900 dark:text-zinc-100">
              revocare il consenso
            </strong>{" "}
            quando vuoi, dal link di disiscrizione in fondo a ogni nostra email
            o scrivendoci. Revocarlo non rende illegittimo quello che abbiamo
            fatto prima.
          </p>
          <p className="mt-3">
            Se pensi che stiamo trattando i tuoi dati in modo scorretto, hai
            diritto di proporre reclamo al{" "}
            <a
              href="https://www.garanteprivacy.it"
              className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Garante per la protezione dei dati personali
            </a>
            .
          </p>
        </Section>

        <Section title="Cookie">
          <p>
            Il sito non usa cookie di profilazione né strumenti di analytics. Il
            form della wishlist funziona senza JavaScript e senza salvare niente
            nel tuo browser.
          </p>
        </Section>

        <p className="mt-12 text-sm text-zinc-500 dark:text-zinc-400">
          <Link
            href="/wishlist"
            className="font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:text-zinc-100 dark:hover:text-zinc-300 dark:focus:ring-zinc-100 dark:focus:ring-offset-black"
          >
            Torna alla wishlist
          </Link>
        </p>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
      <div className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        {children}
      </div>
    </section>
  );
}
