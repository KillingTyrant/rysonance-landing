"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import Image from "next/image";
import immaginazione from "@/assets/landing/esplora-immaginazione.webp";
import mondoCondiviso from "@/assets/landing/esplora-mondo-condiviso.webp";
import multipiattaforma from "@/assets/landing/esplora-multipiattaforma.webp";
import sistemaDiGioco from "@/assets/landing/esplora-sistema-di-gioco.webp";
import { PHONE } from "./breakpoints";
import { pageTop } from "./page-top";
import { WRAP } from "./wrap";

/**
 * Le quattro voci della sezione, nell'ordine in cui si accendono. Ogni voce ha
 * la sua immagine, dentro un box (`BOX`): schermate dell'app o pagine del
 * regolamento sulle illustrazioni di Rysonance, con una parola grande in fondo
 * (Immagina, Condividi, Gioca ovunque, Migliora). Solo arte nostra: le
 * immagini di prova dell'app non lo sono, e vanno tolte prima di fotografarla.
 *
 * Il box ha le proporzioni dell'immagine di «Il digitale al servizio
 * dell’immaginazione» (`BOX_RATIO`, oggi 1080×1382): quella ci entra tutta,
 * anche negli angoli arrotondati. Le altre vanno esportate con le stesse
 * proporzioni; se cambiano di poco, `object-cover` taglia quel poco.
 */
const ITEMS = [
  {
    title: "Il digitale al servizio dell’immaginazione",
    image: immaginazione,
    alt: "La scheda dell’eroe Koren nell’app di Rysonance su uno smartphone, accanto alla sagoma di una creatura cornuta con un occhio rosso, e la scritta «Immagina».",
  },
  {
    title: "Un mondo condiviso tra tutti i giocatori",
    image: mondoCondiviso,
    alt: "La creazione dell’eroe nell’app su uno smartphone: la scelta della specie e della razza, con il bonus della razza Eruscal, su un’illustrazione rossa e la scritta «Condividi».",
  },
  {
    title: "Esperienza multipiattaforma",
    image: multipiattaforma,
    alt: "La stessa partita nell’app su smartphone, tablet e portatile: la mappa a esagoni e la scena narrata, con la scritta «Gioca ovunque».",
  },
  {
    title: "Un sistema di gioco unico",
    image: sistemaDiGioco,
    alt: "Pagine del regolamento di Rysonance: la scheda della razza Gata-Ari, i talenti di una Via e un albero dei talenti, con la scritta «Migliora».",
  },
] as const;

/**
 * L'immagine di una carta, a tutta carta. `sizes`: ogni elenco di carte c'è
 * solo da una parte della soglia del telefono (48rem), dall'altra è nascosto e
 * largo zero.
 * suppressHydrationWarning: iubenda aggiunge `data-cmp-info` alle <img> prima
 * dell'idratazione.
 */
function CardImage({
  item,
  sizes,
}: {
  item: (typeof ITEMS)[number];
  sizes: string;
}) {
  return (
    <Image
      src={item.image}
      alt={item.alt}
      fill
      sizes={sizes}
      suppressHydrationWarning
      className="object-cover"
    />
  );
}

/**
 * Le proporzioni del box, prese dall'immagine di «Il digitale al servizio
 * dell’immaginazione» (larghezza / altezza, come le vuole `aspect-ratio`):
 * cambiando quell'immagine il box la segue.
 */
const BOX_RATIO = `${immaginazione.width} / ${immaginazione.height}`;

/**
 * Il box delle immagini: solo l'immagine, senza fondo né bordo, con gli angoli
 * arrotondati come il riquadro delle domande frequenti (stesso raggio), nelle
 * proporzioni di `BOX_RATIO` (la variabile `--box-ratio` sulla sezione).
 */
const BOX = "relative aspect-(--box-ratio) overflow-hidden rounded-[1.25rem]";

/** Telefono: il box è largo quanto la colonna (al massimo 30,5rem, come `NARROW`). */
const PHONE_SIZES = "(min-width: 48rem) 1px, min(calc(100vw - 2.5rem), 30.5rem)";
/** Da tablet: il box è largo quanto la sua colonna, al massimo 26rem. */
const CARD_SIZES = "(min-width: 48rem) 26rem, 1px";

/** Quanto si scorre per ogni voce, in altezze di schermo (come nella demo GSAP). */
const STEP = 0.5;

/**
 * Quanto si ingrandisce la voce accesa (`scale-120`): oltre a diventare oro e
 * Bold cresce, così si capisce che è lei a seguire lo scroll. È un
 * ingrandimento (`scale`) e non una misura del testo: non sposta le altre voci
 * né la linea oro. Su tablet, dove le voci vanno a capo, il testo va a capo
 * prima (`md:max-w-[83%]`, cioè 1/1,2), così anche accesa resta nella sua
 * colonna; da desktop sta su una riga (vedi sopra).
 */
const GROW = "scale-120";

/**
 * Il parallasse del mostro dietro la sezione ferma: mentre la linea oro
 * scende, il mostro sale di `--monster-drift`, un tratto deciso in
 * `app/page.tsx` (`--monster-drift-max`: fino al 27% dello schermo, meno dove
 * la frase sul mostro ha poco posto). Il pezzo di mostro che continua sotto la
 * sezione parte più in basso dello stesso tratto, così a fine sezione i due
 * combaciano. Il tratto lo accende lo script (`--monster-drift` sulla sezione
 * #eco, la madre di questa): senza JavaScript e con il movimento ridotto vale
 * zero, il mostro resta fermo e la giunta torna quella di sempre.
 */
const DRIFT_ON = "var(--monster-drift-max, 0px)";

const subscribePhone = (onChange: () => void) => {
  const query = window.matchMedia(PHONE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
// Sul server il telefono non si conosce: si disegna come se non lo fosse. Il
// primo disegno è comunque lo stesso (prima voce accesa), e l'impaginazione la
// fanno le classi `md:`, non questo valore.
const usePhone = () =>
  useSyncExternalStore(
    subscribePhone,
    () => window.matchMedia(PHONE).matches,
    () => false,
  );

/**
 * «Il gioco di ruolo, reinventato per le nuove generazioni.» (la sezione
 * «Esplora»), sul modello della demo GSAP «lateral pin indicator»: la sezione
 * resta ferma mentre si scorre, la linea oro a sinistra della lista si
 * allunga, la voce corrente si accende (oro, Bold e più grande) e nel box
 * l'immagine cambia in dissolvenza. Finite le voci, la sezione riparte con la
 * pagina.
 *
 * Niente GSAP: il blocco è `position: sticky` dentro una sezione alta 100svh
 * più mezzo schermo per voce, e l'avanzamento è la frazione di quell'altezza
 * già scorsa. Basta un ascoltatore di scroll, raggruppato per frame: la linea
 * si aggiorna direttamente sul DOM (un `transform`, niente render), lo stato
 * React cambia solo quando cambia la voce.
 *
 * Tre misure:
 * - telefono (`PHONE`): nessun blocco, la sezione scorre come le altre: il
 *   titolo, le quattro carte una sotto l'altra (ognuna col suo titolo) e il
 *   form. La lista con la linea oro lì non c'è: serve solo all'avanzamento,
 *   e ripeterebbe i titoli delle carte;
 * - tablet (`md`): blocco fermo e impaginazione orizzontale come su desktop,
 *   in due colonne uguali (carta e lista vicine), con le voci che possono
 *   andare a capo;
 * - desktop (`lg`): la colonna di destra, quella del testo, è di 30rem: ci
 *   sta su una riga la voce più lunga («Il digitale al servizio
 *   dell’immaginazione»): a riposo (Medium a 22px) con margine, accesa
 *   (Bold, ingrandita di `GROW`) esce di pochi pixel nel margine della
 *   pagina. Fra le colonne 4rem; la carta prende quello che resta della
 *   colonna del sito. Se cambiano le voci, va rimisurata.
 *
 * Senza JavaScript resta accesa la prima voce. Con movimento ridotto il blocco
 * resta (lo scroll lo fa chi legge), ma voci e immagini cambiano senza
 * animazioni.
 *
 * `form` è il form della wishlist, come nelle altre sezioni: arriva già
 * disegnato dalla pagina, perché è un Server Component (invio e consenso
 * passano dalla Server Action) e questo componente gira nel browser.
 *
 * `backdrop`, da tablet con lo schermo in orizzontale (`wide:`, vedi
 * `globals.css`): lo sfondo del blocco fermo, la parte alta del Void Monster
 * che poi continua sotto la sezione (vedi `app/page.tsx`), scurito dietro al
 * testo col blu notte #020817. Mentre il blocco è fermo il mostro sale in
 * parallasse (`DRIFT_ON`). Sul telefono e sugli schermi in verticale il
 * fondo è lo stesso blu e il mostro comincia dopo, sfumando da quel colore.
 */
export function ExploreSection({
  form,
  backdrop,
}: {
  form: ReactNode;
  backdrop?: ReactNode;
}) {
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const track = useRef<HTMLSpanElement>(null);
  const firstBaseline = useRef<HTMLSpanElement>(null);
  const lastBaseline = useRef<HTMLSpanElement>(null);
  const monster = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const phone = usePhone();
  const count = ITEMS.length;
  // Sul telefono la sezione non è ferma: niente avanzamento, prima voce.
  const shown = phone ? 0 : active;

  useEffect(() => {
    const el = section.current;
    const pinned = frame.current;
    const bar = fill.current;
    const line = track.current;
    const first = firstBaseline.current;
    const last = lastBaseline.current;
    if (phone || !el || !pinned || !bar || !line || !first || !last) return;

    /**
     * Fin dove arriva la linea, in frazioni della sua guida: all'inizio la
     * linea di base della prima voce, alla fine quella dell'ultima. Le misura
     * dal testo vero (un segno largo e alto zero in fondo a ciascuna voce
     * poggia sulla linea di base), così valgono anche se una voce va a capo.
     */
    const ends = () => {
      const box = line.getBoundingClientRect();
      if (box.height <= 0) return [1 / count, 1];
      const at = (mark: HTMLElement) =>
        (mark.getBoundingClientRect().bottom - box.top) / box.height;
      return [at(first), at(last)];
    };

    // Il parallasse dello sfondo, solo se chi legge non ha chiesto meno movimento
    // (vedi `DRIFT_ON`): il tratto vale anche per il pezzo di mostro sotto la
    // sezione, quindi sta sulla madre comune, #eco.
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const backdropLayer = monster.current;
    const eco = el.parentElement;
    const setDrift = () => {
      if (still.matches) eco?.style.removeProperty("--monster-drift");
      else eco?.style.setProperty("--monster-drift", DRIFT_ON);
    };
    setDrift();

    let raf = 0;
    const update = () => {
      raf = 0;
      // Lo spazio in cui il blocco resta fermo: la sezione meno lo schermo.
      const distance = el.offsetHeight - pinned.offsetHeight;
      // Dalla posizione nella pagina e non da getBoundingClientRect: quando
      // la sezione dopo le scorre sopra, questa si rimpicciolisce (vedi
      // `slide-stack.tsx`) e le voci non devono tornare indietro.
      const scrolled = window.scrollY - pageTop(el);
      const progress =
        distance > 0 ? Math.min(1, Math.max(0, scrolled / distance)) : 0;
      // La linea parte ferma sulla linea di base della prima voce e, mentre si
      // scorre, scende fino a quella dell'ultima quando finisce la sezione.
      const [start, end] = ends();
      bar.style.transform = `scaleY(${start + progress * (end - start)})`;
      // Intanto il mostro dietro sale (vedi `DRIFT_ON`): a fine sezione è salito
      // di tutto il tratto e combacia col pezzo che continua sotto.
      if (backdropLayer) {
        backdropLayer.style.transform = `translate3d(0, calc(var(--monster-drift, 0px) * ${-progress}), 0)`;
      }
      setActive(Math.min(count - 1, Math.floor(progress * count)));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const onMotionChange = () => {
      setDrift();
      schedule();
    };
    still.addEventListener("change", onMotionChange);
    // Il font arriva dopo il primo disegno e sposta un po' le linee di base.
    let live = true;
    document.fonts?.ready.then(() => live && schedule());
    return () => {
      live = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      still.removeEventListener("change", onMotionChange);
      // Se si passa al telefono, la linea torna sulla prima voce e il mostro
      // al suo posto, senza parallasse.
      bar.style.transform = `scaleY(${1 / count})`;
      if (backdropLayer) backdropLayer.style.transform = "";
      eco?.style.removeProperty("--monster-drift");
    };
  }, [count, phone]);

  return (
    <section
      ref={section}
      aria-labelledby="esplora-titolo"
      className="relative overflow-x-clip bg-[#020817] text-white md:h-(--explore-h)"
      style={
        {
          "--explore-h": `${100 + count * STEP * 100}svh`,
          "--box-ratio": BOX_RATIO,
        } as CSSProperties
      }
    >
      {/*
        * Da tablet il blocco è alto uno schermo e fermo; `pt-16` lo centra
        * sotto la barra fissa in alto, il margine in fondo (fino a 96px) lo
        * alza di altri 48px, così sotto resta più aria prima della frase sul
        * mostro. Sugli schermi bassi il margine cala (pieno da 736px d'altezza,
        * niente sotto i 640px), perché il titolo non finisca sotto la barra.
        * Sul telefono è un blocco normale.
        */}
      <div
        ref={frame}
        className="relative pt-16 pb-16 md:sticky md:top-0 md:flex md:h-svh md:items-center md:pt-16 md:pb-[clamp(0px,calc(100svh_-_40rem),6rem)]"
      >
        {backdrop && (
          <div aria-hidden="true" className="absolute inset-0 hidden overflow-hidden wide:block">
            {/*
              * Il mostro su un livello suo, che lo scroll fa salire
              * (parallasse, vedi `DRIFT_ON`). È più alto dello schermo di
              * tutto il tratto: salendo non lascia mai un vuoto in fondo. Il
              * velo scuro sopra resta fermo.
              */}
            <div
              ref={monster}
              className="absolute inset-x-0 top-0 h-[calc(100%+var(--monster-drift,0px))] will-change-transform"
            >
              {backdrop}
            </div>
            {/*
              * Scurisce il mostro dietro al testo, nel blu notte #020817:
              * quasi pieno fin sotto il centro, dove sta il contenuto, poi si
              * spegne. Al fondo del blocco è trasparente: lì il mostro continua
              * nella sezione, e uno scalino di luce si vedrebbe.
              */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(2_8_23/0.88)_0%,rgb(2_8_23/0.84)_65%,rgb(2_8_23/0.62)_85%,transparent_100%)]" />
          </div>
        )}
        {/*
          * Telefono: titolo, carte, form, uno sotto l'altro, nella colonna
          * stretta delle altre sezioni. Da tablet: prima la carta della voce
          * accesa, a sinistra, su tutte le righe; poi titolo, lista e form a
          * destra, centrati in verticale fra due righe elastiche.
          */}
        <div
          className={`${WRAP} relative grid gap-y-6 max-md:max-w-[30.5rem] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:grid-rows-[1fr_auto_auto_auto_1fr] md:gap-x-10 md:gap-y-0 lg:grid-cols-[minmax(0,1fr)_30rem] lg:gap-x-16`}
        >
          <h2
            id="esplora-titolo"
            className="max-w-[13em] text-[31px] leading-[0.97] font-extrabold text-balance md:col-start-2 md:row-start-2 md:text-[2rem] md:leading-[0.9] lg:text-[2.25rem] lg:leading-[0.82]"
          >
            Il gioco di ruolo, reinventato per le nuove generazioni.
          </h2>

          {/*
            * Telefono: i box una sotto l'altro, larghi quanto la colonna, col
            * titolo sotto (lì la lista non c'è, quindi non è una ripetizione).
            * Qui sono il contenuto, non un doppione della lista: i lettori di
            * schermo li leggono.
            */}
          <ul className="grid gap-8 md:hidden">
            {ITEMS.map((item) => (
              <li key={item.title}>
                <div className={BOX}>
                  <CardImage item={item} sizes={PHONE_SIZES} />
                </div>
                <span className="mt-3 block text-lg leading-tight font-extrabold">
                  {item.title}
                </span>
              </li>
            ))}
          </ul>

          {/*
            * Da tablet un box solo, con l'immagine della voce accesa, che
            * cambia in dissolvenza; senza titolo (è la voce accesa della
            * lista). Largo quanto la sua colonna, centrato in verticale
            * accanto al testo; sugli schermi bassi si stringe perché non superi
            * lo spazio fra la barra in alto e il margine in fondo, con almeno
            * 16px d'aria sopra e sotto.
            */}
          <div
            className={`${BOX} hidden md:col-start-1 md:row-span-full md:block md:w-[min(100%,calc((100svh_-_12rem)*var(--box-ratio)))] md:self-center`}
          >
            {ITEMS.map((item, i) => (
              <div
                key={item.title}
                aria-hidden="true"
                className={`absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none ${
                  i === shown ? "opacity-100" : "opacity-0"
                }`}
              >
                <CardImage item={item} sizes={CARD_SIZES} />
              </div>
            ))}
          </div>

          <div className="relative ml-3 hidden md:col-start-2 md:row-start-3 md:mt-6 md:block">
            {/*
              * La guida della linea va dalla prima all'ultima riga di testo
              * (rientra quanto il padding delle voci); la linea si allunga
              * dall'alto, dalla linea di base della prima voce a quella
              * dell'ultima (vedi `ends`). Lo stile iniziale lo scrive React
              * una volta sola (senza JavaScript resta a un quarto); poi è lo
              * scroll a aggiornarlo, e React non lo tocca più perché non cambia.
              */}
            <span
              ref={track}
              aria-hidden="true"
              className="absolute inset-y-2 left-0 w-1 lg:inset-y-[0.7rem]"
            >
              <span
                ref={fill}
                className="block h-full origin-top rounded-full bg-gold"
                style={{ transform: `scaleY(${1 / count})` }}
              />
            </span>
            <ol className="pl-6">
              {ITEMS.map((item, i) => (
                <li
                  key={item.title}
                  aria-current={i === shown ? "step" : undefined}
                  // La voce accesa diventa oro, passa da Medium a Bold (il
                  // Cabinet Grotesk è variabile, quindi anche il peso si
                  // anima) e si ingrandisce (`GROW`).
                  className={`py-2 text-lg leading-[1.2] transition-[color,font-weight] duration-300 ease-out motion-reduce:transition-none lg:py-[0.7rem] lg:text-[1.375rem] ${
                    i === shown ? "font-bold text-gold" : "font-medium text-white"
                  }`}
                >
                  <span
                    className={`inline-block origin-left transition-transform duration-300 ease-out motion-reduce:transition-none md:max-w-[83%] lg:max-w-none ${
                      i === shown ? GROW : "scale-100"
                    }`}
                  >
                    {item.title}
                  </span>
                  {/* Segno sulla linea di base, per la linea oro (prima e ultima voce). */}
                  {(i === 0 || i === count - 1) && (
                    <span
                      ref={i === 0 ? firstBaseline : lastBaseline}
                      aria-hidden="true"
                      className="inline-block size-0"
                    />
                  )}
                </li>
              ))}
            </ol>
          </div>

          {/* Come il form dell'intestazione: largo quanto lui, allineato al testo da tablet. */}
          <div className="mx-auto mt-4 w-full max-w-md md:col-start-2 md:row-start-4 md:mx-0 md:mt-10 md:max-w-[22rem] lg:mt-14">
            {form}
          </div>
        </div>
      </div>
    </section>
  );
}
