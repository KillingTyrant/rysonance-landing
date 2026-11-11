import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";

/**
 * Informativa privacy (GDPR art. 13), scritta sui dati che la wishlist
 * raccoglie davvero — vedi [mailchimp.ts](../wishlist/mailchimp.ts),
 * [consent.ts](../wishlist/consent.ts) e
 * [attribution.ts](../wishlist/attribution.ts). Se cambia quello che va a
 * Mailchimp, questa pagina va cambiata con lui: un'informativa che elenca dati
 * diversi da quelli trattati è peggio di nessuna informativa.
 *
 * Vale anche per le mail, che si scrivono su Mailchimp: il tracciamento di
 * aperture e clic lì è acceso di default, e questa pagina dice che non c'è
 * analytics né profilazione. Va spento in ogni mail, o scritto qui.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * DA COMPILARE PRIMA DI PUBBLICARE
 *
 * I valori qui sotto non sono deducibili dal codice e non possono essere
 * inventati: l'identità del titolare è un elemento obbligatorio. Sono scritti
 * fra virgolette basse apposta, così se restano vuoti si vedono sulla pagina
 * pubblicata invece di passare inosservati.
 * ─────────────────────────────────────────────────────────────────────────
 */
const TITOLARE = {
  nome: "«ragione sociale, o nome e cognome se persona fisica»",
  indirizzo: "«indirizzo completo della sede»",
  email: "«indirizzo email per le richieste privacy»",
};

const AGGIORNAMENTO = "11 novembre 2026";

export const metadata: Metadata = {
  title: "Informativa privacy — Rysonance",
  description:
    "Come Rysonance tratta i dati di chi si iscrive alla wishlist: quali dati, perché, per quanto e con quali diritti.",
};

export default function Privacy() {
  return (
    <div className="flex flex-1 flex-col bg-paper font-sans text-ink">
      <header className="bg-burgundy px-5 py-6 text-white">
        <Link
          href="/"
          aria-label="Torna alla home di Rysonance"
          className="mx-auto block w-fit"
        >
          <Logo variant="wordmark" animated={false} className="h-auto w-36" />
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-col px-5 py-12 lg:py-16">
        <h1 className="text-[31px] leading-[0.97] font-bold">
          Informativa privacy
        </h1>
        <p className="mt-3 text-sm text-ink/60">
          Ultimo aggiornamento: {AGGIORNAMENTO}
        </p>

        <p className="mt-6 text-[15px] leading-relaxed text-ink/80">
          Questa pagina riguarda un solo trattamento: la wishlist di Rysonance,
          cioè la lista di indirizzi a cui scriveremo quando il gioco sarà
          pronto. Non ci sono account, non ci sono cookie di profilazione e non
          c&apos;è nessuna piattaforma di analytics.
        </p>

        <Section title="Chi tratta i dati">
          <p>
            Il titolare del trattamento è {TITOLARE.nome}, {TITOLARE.indirizzo}.
            Per qualsiasi richiesta relativa ai tuoi dati puoi scrivere a{" "}
            <span className="font-bold text-ink">
              {TITOLARE.email}
            </span>
            .
          </p>
        </Section>

        <Section title="Quali dati raccogliamo">
          <p>Quando ti iscrivi alla wishlist registriamo:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="font-bold text-ink">
                Il tuo indirizzo email.
              </strong>{" "}
              È l&apos;unico dato che ci dai attivamente, e l&apos;unico senza
              il quale non possiamo avvisarti.
            </li>
            <li>
              <strong className="font-bold text-ink">
                Data e ora dell&apos;iscrizione e indirizzo IP.
              </strong>{" "}
              Servono a dimostrare che il consenso è stato prestato davvero, da
              qualcuno, in un certo momento. Non li usiamo per profilarti né per
              riconoscerti quando torni sul sito.
            </li>
            <li>
              <strong className="font-bold text-ink">
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
              <strong className="font-bold text-ink">
                Avvisarti al lancio</strong>{" "}
              — base giuridica: il tuo{" "}
              <strong className="font-bold text-ink">
                consenso
              </strong>{" "}
              (art. 6.1.a GDPR), che presti iscrivendoti e puoi ritirare quando
              vuoi.
            </li>
            <li>
              <strong className="font-bold text-ink">
                Poter dimostrare quel consenso</strong>{" "}
              (data e IP) — base giuridica: il{" "}
              <strong className="font-bold text-ink">
                legittimo interesse
              </strong>{" "}
              (art. 6.1.f) a rispondere a chi contesta di essersi iscritto, come
              richiesto dall&apos;art. 7.1.
            </li>
            <li>
              <strong className="font-bold text-ink">
                Capire da quali canali arrivano le iscrizioni</strong>{" "}
              — base giuridica: il{" "}
              <strong className="font-bold text-ink">
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
            Nessuno a cui non serva. La lista è conservata presso un fornitore
            che tratta i dati per nostro conto come responsabile (art. 28
            GDPR):
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="font-bold text-ink">
                Mailchimp
              </strong>{" "}
              (The Rocket Science Group LLC, Stati Uniti) — il servizio in cui
              la lista è conservata e da cui partono le email. Tiene tutti i
              dati elencati sopra, e gestisce il link per cancellarti che trovi
              in ogni messaggio.
            </li>
          </ul>
          <p className="mt-3">
            Non vendiamo, non cediamo e non scambiamo la lista con nessuno. Se
            un fornitore tratta i dati fuori dallo Spazio economico europeo,
            come Mailchimp negli Stati Uniti, il trasferimento avviene sulla
            base delle clausole contrattuali tipo approvate dalla Commissione
            europea.
          </p>
        </Section>

        <Section title="I tuoi diritti">
          <p>
            Puoi chiederci in qualsiasi momento di{" "}
            <strong className="font-bold text-ink">
              accedere
            </strong>{" "}
            ai tuoi dati, di{" "}
            <strong className="font-bold text-ink">
              correggerli
            </strong>
            , di{" "}
            <strong className="font-bold text-ink">
              cancellarli
            </strong>
            , di{" "}
            <strong className="font-bold text-ink">
              limitarne
            </strong>{" "}
            il trattamento, di{" "}
            <strong className="font-bold text-ink">
              riceverli in un formato leggibile
            </strong>{" "}
            e di{" "}
            <strong className="font-bold text-ink">
              opporti
            </strong>{" "}
            ai trattamenti fondati sul legittimo interesse. Scrivi a{" "}
            {TITOLARE.email}: rispondiamo entro un mese.
          </p>
          <p className="mt-3">
            Puoi{" "}
            <strong className="font-bold text-ink">
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
              className="underline underline-offset-2 hover:text-burgundy"
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

        <p className="mt-12 text-sm text-ink/60">
          <Link
            href="/wishlist"
            className="font-bold text-ink underline underline-offset-2 hover:text-burgundy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
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
      <h2 className="text-lg font-bold text-ink">
        {title}
      </h2>
      <div className="mt-3 text-[15px] leading-relaxed text-ink/80">
        {children}
      </div>
    </section>
  );
}
