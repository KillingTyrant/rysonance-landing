"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { SOCIAL } from "./social";
import styles from "./social-icons.module.css";

/**
 * Quando entrano le icone, in ms dal momento in cui la barra si compatta: il
 * bottone «Iscriviti» sale dopo 300ms e ci mette 190ms (le sue classi in
 * `navbar.tsx`, `delay-300 duration-190`), le icone partono appena ha finito.
 * Se cambiano i tempi del bottone, vanno cambiati anche qui.
 */
const CENTER_DELAY = 300 + 190;
/** Le due ai lati arrivano poco dopo quella centrale. */
const SIDES_DELAY = CENTER_DELAY + 80;
/** Quanto trema l'icona di Discord prima che compaia «In arrivo». */
const SHAKE_MS = 420;
/** Dopo un tocco (telefono) o un Invio, quanto resta «In arrivo». */
const TAP_OPEN_MS = 2200;

/** Le classi comuni del movimento: entrano piano, escono svelte. */
const MOVE = "transition-[translate,opacity] motion-reduce:transition-none";
const IN = "duration-250 ease-out";
const OUT = "opacity-0 duration-200 ease-in";

/**
 * Le icone del design (`Mockup screen_Landing1`: InstagramLogo, TiktokLogo,
 * DiscordLogo, 32×32), nel colore del testo invece del grigio del file.
 */
const ICON = "size-5 md:size-6";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={ICON} fill="currentColor">
      <path d="M22 3H10C8.14409 3.00199 6.36477 3.74012 5.05245 5.05245C3.74012 6.36477 3.00199 8.14409 3 10V22C3.00199 23.8559 3.74012 25.6352 5.05245 26.9476C6.36477 28.2599 8.14409 28.998 10 29H22C23.8559 28.998 25.6352 28.2599 26.9476 26.9476C28.2599 25.6352 28.998 23.8559 29 22V10C28.998 8.14409 28.2599 6.36477 26.9476 5.05245C25.6352 3.74012 23.8559 3.00199 22 3ZM16 22C14.8133 22 13.6533 21.6481 12.6666 20.9888C11.6799 20.3295 10.9108 19.3925 10.4567 18.2961C10.0026 17.1997 9.88378 15.9933 10.1153 14.8295C10.3468 13.6656 10.9182 12.5965 11.7574 11.7574C12.5965 10.9182 13.6656 10.3468 14.8295 10.1153C15.9933 9.88378 17.1997 10.0026 18.2961 10.4567C19.3925 10.9108 20.3295 11.6799 20.9888 12.6666C21.6481 13.6533 22 14.8133 22 16C21.9983 17.5908 21.3657 19.116 20.2408 20.2408C19.116 21.3657 17.5908 21.9983 16 22ZM23.5 10C23.2033 10 22.9133 9.91203 22.6666 9.7472C22.42 9.58238 22.2277 9.34811 22.1142 9.07403C22.0007 8.79994 21.9709 8.49834 22.0288 8.20736C22.0867 7.91639 22.2296 7.64912 22.4393 7.43934C22.6491 7.22956 22.9164 7.0867 23.2074 7.02882C23.4983 6.97094 23.7999 7.00065 24.074 7.11418C24.3481 7.22771 24.5824 7.41997 24.7472 7.66664C24.912 7.91332 25 8.20333 25 8.5C25 8.89782 24.842 9.27936 24.5607 9.56066C24.2794 9.84196 23.8978 10 23.5 10ZM20 16C20 16.7911 19.7654 17.5645 19.3259 18.2223C18.8864 18.8801 18.2616 19.3928 17.5307 19.6955C16.7998 19.9983 15.9956 20.0775 15.2196 19.9231C14.4437 19.7688 13.731 19.3878 13.1716 18.8284C12.6122 18.269 12.2312 17.5563 12.0769 16.7804C11.9225 16.0044 12.0017 15.2002 12.3045 14.4693C12.6072 13.7384 13.1199 13.1136 13.7777 12.6741C14.4355 12.2346 15.2089 12 16 12C17.0609 12 18.0783 12.4214 18.8284 13.1716C19.5786 13.9217 20 14.9391 20 16Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={ICON} fill="currentColor">
      <path d="M29 10V15C29 15.2652 28.8946 15.5196 28.7071 15.7071C28.5196 15.8946 28.2652 16 28 16C25.911 16.0049 23.8521 15.5026 22 14.5363V19.5C22 22.0196 20.9991 24.4359 19.2175 26.2175C17.4359 27.9991 15.0196 29 12.5 29C9.98044 29 7.56408 27.9991 5.78249 26.2175C4.00089 24.4359 3 22.0196 3 19.5C3 14.8875 6.36375 10.81 10.825 10.015C10.9689 9.98942 11.1167 9.9957 11.2579 10.0334C11.3992 10.0711 11.5304 10.1393 11.6424 10.2332C11.7544 10.3271 11.8445 10.4445 11.9063 10.5769C11.9681 10.7094 12.0001 10.8538 12 11V16.3363C12.0001 16.5255 11.9464 16.7109 11.8453 16.8709C11.7442 17.0309 11.5997 17.1589 11.4288 17.24C11.0245 17.4317 10.6792 17.7283 10.4287 18.099C10.1782 18.4696 10.0317 18.9007 10.0046 19.3472C9.97747 19.7938 10.0707 20.2394 10.2744 20.6376C10.4782 21.0359 10.7851 21.3722 11.1631 21.6114C11.5411 21.8506 11.9764 21.984 12.4236 21.9977C12.8707 22.0114 13.3133 21.9048 13.7053 21.6891C14.0972 21.4735 14.4241 21.1566 14.6518 20.7715C14.8796 20.3865 14.9998 19.9474 15 19.5V3C15 2.73478 15.1054 2.48043 15.2929 2.29289C15.4804 2.10536 15.7348 2 16 2H21C21.2652 2 21.5196 2.10536 21.7071 2.29289C21.8946 2.48043 22 2.73478 22 3C22.0017 4.59079 22.6343 6.11595 23.7592 7.24081C24.884 8.36567 26.4092 8.99835 28 9C28.2652 9 28.5196 9.10536 28.7071 9.29289C28.8946 9.48043 29 9.73478 29 10Z" />
    </svg>
  );
}

function DiscordIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={`${ICON} ${className}`} fill="currentColor">
      <path d="M30.9388 21.7987L27.25 7.25C27.1529 6.87125 26.9475 6.52903 26.6589 6.26527C26.3702 6.0015 26.0109 5.82765 25.625 5.765L21.1175 5.025C20.6206 4.94508 20.1117 5.05283 19.6899 5.3273C19.268 5.60177 18.9633 6.02333 18.835 6.51L18.8088 6.61625C18.7918 6.68375 18.789 6.75406 18.8008 6.82268C18.8125 6.89129 18.8385 6.95669 18.8769 7.0147C18.9154 7.07271 18.9656 7.12205 19.0242 7.15955C19.0829 7.19706 19.1487 7.2219 19.2175 7.2325C20.2518 7.3843 21.2722 7.61923 22.2688 7.935C22.5179 8.01017 22.7291 8.17729 22.8596 8.40245C22.99 8.62762 23.0299 8.89398 22.9713 9.1475C22.9375 9.27961 22.8771 9.40343 22.7938 9.51135C22.7104 9.61926 22.6059 9.70899 22.4866 9.77502C22.3673 9.84105 22.2358 9.88199 22.1001 9.89531C21.9644 9.90863 21.8274 9.89407 21.6975 9.8525C17.9998 8.71848 14.0477 8.71413 10.3475 9.84C10.0971 9.9242 9.82387 9.90871 9.58458 9.79674C9.34529 9.68478 9.15832 9.48495 9.0625 9.23875C9.01696 9.11242 8.99733 8.97821 9.00478 8.84412C9.01223 8.71004 9.04662 8.57883 9.10588 8.45832C9.16514 8.33781 9.24807 8.23047 9.34971 8.14271C9.45136 8.05495 9.56964 7.98856 9.6975 7.9475C10.7065 7.62611 11.7399 7.387 12.7875 7.2325C12.8563 7.2219 12.9221 7.19706 12.9808 7.15955C13.0394 7.12205 13.0896 7.07271 13.1281 7.0147C13.1665 6.95669 13.1925 6.89129 13.2042 6.82268C13.216 6.75406 13.2132 6.68375 13.1963 6.61625L13.17 6.51C13.0417 6.02291 12.7366 5.60108 12.3141 5.32676C11.8916 5.05244 11.3822 4.94531 10.885 5.02625L6.375 5.76625C5.98922 5.82881 5.63004 6.00248 5.34142 6.266C5.05281 6.52953 4.84729 6.87148 4.75 7.25L1.06125 21.7987C0.945592 22.2561 0.995929 22.7396 1.20331 23.1633C1.41068 23.5869 1.76165 23.9233 2.19375 24.1125L10.5688 27.8263C10.8206 27.9382 11.0926 27.9975 11.3682 28.0004C11.6438 28.0034 11.9171 27.9499 12.1712 27.8434C12.4254 27.7369 12.6551 27.5795 12.8462 27.3809C13.0373 27.1824 13.1858 26.9468 13.2825 26.6887L13.7188 25.5075C13.7447 25.4367 13.7544 25.361 13.747 25.286C13.7396 25.211 13.7154 25.1386 13.676 25.0743C13.6367 25.01 13.5834 24.9554 13.52 24.9146C13.4566 24.8738 13.3848 24.8479 13.31 24.8388C12.0957 24.6917 10.8976 24.4323 9.73125 24.0637C9.48314 23.9883 9.27284 23.8217 9.14271 23.5974C9.01258 23.3731 8.97231 23.1078 9.03 22.855C9.06344 22.7225 9.12367 22.5983 9.20698 22.49C9.29029 22.3817 9.39491 22.2916 9.51439 22.2253C9.63386 22.159 9.76566 22.1179 9.90164 22.1045C10.0376 22.0911 10.1749 22.1058 10.305 22.1475C14.0166 23.2842 17.9834 23.2842 21.695 22.1475C21.8249 22.106 21.962 22.0914 22.0978 22.1048C22.2336 22.1182 22.3651 22.1593 22.4845 22.2254C22.6038 22.2916 22.7083 22.3815 22.7916 22.4895C22.8749 22.5976 22.9352 22.7215 22.9688 22.8538C23.0271 23.1068 22.9871 23.3725 22.8569 23.5972C22.7267 23.8218 22.516 23.9886 22.2675 24.0637C21.1016 24.4324 19.9039 24.6918 18.69 24.8388C18.6152 24.8479 18.5434 24.8738 18.48 24.9146C18.4166 24.9554 18.3633 25.01 18.324 25.0743C18.2846 25.1386 18.2604 25.211 18.253 25.286C18.2456 25.361 18.2553 25.4367 18.2813 25.5075L18.7175 26.6887C18.8144 26.9467 18.9629 27.1821 19.1541 27.3806C19.3452 27.579 19.5749 27.7364 19.829 27.8429C20.0831 27.9494 20.3563 28.0029 20.6318 28C20.9074 27.9971 21.1794 27.938 21.4313 27.8263L29.8063 24.1125C30.2384 23.9233 30.5893 23.5869 30.7967 23.1633C31.0041 22.7396 31.0544 22.2561 30.9388 21.7987ZM11.5 19C11.2033 19 10.9133 18.912 10.6666 18.7472C10.42 18.5824 10.2277 18.3481 10.1142 18.074C10.0007 17.7999 9.97095 17.4983 10.0288 17.2074C10.0867 16.9164 10.2296 16.6491 10.4393 16.4393C10.6491 16.2296 10.9164 16.0867 11.2074 16.0288C11.4983 15.9709 11.7999 16.0007 12.074 16.1142C12.3481 16.2277 12.5824 16.42 12.7472 16.6666C12.912 16.9133 13 17.2033 13 17.5C13 17.8978 12.842 18.2794 12.5607 18.5607C12.2794 18.842 11.8978 19 11.5 19ZM20.5 19C20.2033 19 19.9133 18.912 19.6666 18.7472C19.42 18.5824 19.2277 18.3481 19.1142 18.074C19.0007 17.7999 18.9709 17.4983 19.0288 17.2074C19.0867 16.9164 19.2296 16.6491 19.4393 16.4393C19.6491 16.2296 19.9164 16.0867 20.2074 16.0288C20.4983 15.9709 20.7999 16.0007 21.074 16.1142C21.3481 16.2277 21.5824 16.42 21.7472 16.6666C21.912 16.9133 22 17.2033 22 17.5C22 17.8978 21.842 18.2794 21.5607 18.5607C21.2794 18.842 20.8978 19 20.5 19Z" />
    </svg>
  );
}

/** Il cerchio cliccabile attorno a ogni icona: 32px sul telefono, 40px dal tablet. */
const HIT =
  "flex size-8 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:size-10";

/**
 * Le icone social al centro della barra in alto: Instagram, TikTok, Discord.
 * Compaiono quando la barra si compatta, appena il bottone «Iscriviti» ha
 * finito di salire (`CENTER_DELAY`): quella centrale sale dal
 * fondo della barra come il bottone, le due ai lati arrivano dai lati e si
 * mettono in posizione. Tornando in cima escono subito, insieme al bottone.
 * Nascoste sono `inert`, fuori dal tab e dai lettori di schermo.
 *
 * Instagram e TikTok aprono il profilo in una nuova scheda. Discord non c'è
 * ancora: al passaggio del mouse, al fuoco da tastiera o al tocco l'icona
 * trema e poi compare «In arrivo» sotto la barra (dopo un tocco o un Invio
 * resta 2,2s; Esc la chiude). Con il movimento ridotto niente tremolio e
 * niente movimento: le icone compaiono e basta.
 *
 * Ogni icona sta in un riquadro alto quanto la barra che la taglia solo in
 * verticale (`overflow-y-clip`): quella centrale sale dal bordo della barra,
 * quelle ai lati scorrono di lato senza essere tagliate. Il movimento sta su
 * un involucro e il colore al passaggio sul link: una sola `transition` per
 * tutti e due si sovrascriverebbe (e il colore aspetterebbe il ritardo).
 */
export function SocialIcons({ shown }: { shown: boolean }) {
  const tooltipId = useId();
  const [phase, setPhase] = useState<"idle" | "shake" | "open">("idle");
  const [shakes, setShakes] = useState(0);
  const timers = useRef<number[]>([]);
  // Il tipo dell'ultimo puntatore premuto: "" per la tastiera.
  const lastPointer = useRef("");

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  const close = () => {
    clear();
    setPhase("idle");
  };
  /** Trema, poi «In arrivo»; con `holdMs` si richiude da solo. */
  const open = (holdMs?: number) => {
    clear();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const after = (ms: number, fn: () => void) =>
      timers.current.push(window.setTimeout(fn, ms));
    if (still) setPhase("open");
    else {
      setShakes((n) => n + 1);
      setPhase("shake");
      after(SHAKE_MS, () => setPhase("open"));
    }
    if (holdMs) after((still ? 0 : SHAKE_MS) + holdMs, () => setPhase("idle"));
  };

  // La barra torna in cima: via anche il messaggio.
  useEffect(() => {
    if (shown) return;
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    // Si azzera insieme alla barra, non a ogni render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase("idle");
  }, [shown]);
  useEffect(
    () => () => timers.current.forEach((t) => window.clearTimeout(t)),
    [],
  );

  const delay = (ms: number): CSSProperties => ({
    transitionDelay: shown ? `${ms}ms` : "0ms",
  });

  return (
    <div
      inert={!shown}
      className="absolute inset-y-0 left-[calc(50%-3.2rem)] flex -translate-x-1/2 items-center gap-0.5 md:left-1/2 md:gap-1"
    >
      <div className="flex h-full items-center overflow-x-visible overflow-y-clip">
        <div
          style={delay(SIDES_DELAY)}
          className={`${MOVE} ${shown ? `translate-x-0 opacity-100 ${IN}` : `-translate-x-5 ${OUT}`}`}
        >
          <a
            href={SOCIAL.instagram}
            target="_blank"
            rel="noopener noreferrer"
            // iubenda aggiunge `data-cmp-ab` ai link esterni prima dell'idratazione.
            suppressHydrationWarning
            aria-label="Instagram di Rysonance (si apre in una nuova scheda)"
            className={HIT}
          >
            <InstagramIcon />
          </a>
        </div>
      </div>

      <div className="flex h-full items-center overflow-x-visible overflow-y-clip">
        <div
          style={delay(CENTER_DELAY)}
          className={`${MOVE} ${shown ? `translate-y-0 opacity-100 ${IN}` : `translate-y-12 ${OUT}`}`}
        >
          <a
            href={SOCIAL.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            suppressHydrationWarning
            aria-label="TikTok di Rysonance (si apre in una nuova scheda)"
            className={HIT}
          >
            <TikTokIcon />
          </a>
        </div>
      </div>

      {/* Il riquadro comprende anche il messaggio: passandoci sopra resta aperto. */}
      <div
        className="relative flex h-full items-center"
        onPointerEnter={(e) => e.pointerType === "mouse" && open()}
        onPointerLeave={(e) => e.pointerType === "mouse" && close()}
      >
        <div className="flex h-full items-center overflow-x-visible overflow-y-clip">
          <div
            style={delay(SIDES_DELAY)}
            className={`${MOVE} ${shown ? `translate-x-0 opacity-100 ${IN}` : `translate-x-5 ${OUT}`}`}
          >
            <button
              type="button"
              aria-label="Discord"
              aria-describedby={tooltipId}
              onPointerDown={(e) => {
                lastPointer.current = e.pointerType;
              }}
              onClick={() => {
                // Col mouse ci pensa il passaggio; qui il tocco e la tastiera.
                if (lastPointer.current !== "mouse") open(TAP_OPEN_MS);
                lastPointer.current = "";
              }}
              onFocus={(e) =>
                e.currentTarget.matches(":focus-visible") && open()
              }
              onBlur={close}
              onKeyDown={(e) => e.key === "Escape" && close()}
              className={`${HIT} cursor-default`}
            >
              <DiscordIcon
                key={shakes}
                className={phase === "shake" ? styles.shake : ""}
              />
            </button>
          </div>
        </div>
        <span
          id={tooltipId}
          role="tooltip"
          className={`pointer-events-none absolute top-[calc(100%-0.25rem)] left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1.5 text-[0.8125rem] leading-none font-bold whitespace-nowrap text-ink transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none ${
            phase === "open"
              ? "translate-y-0 opacity-100"
              : "-translate-y-1 opacity-0"
          }`}
        >
          In arrivo
        </span>
      </div>
    </div>
  );
}
