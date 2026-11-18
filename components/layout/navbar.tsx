"use client";

import Link from "next/link";
import { useSyncExternalStore, type CSSProperties, type MouseEvent } from "react";
import { WRAP } from "@/components/landing/wrap";
import { LETTERS_GAP, Logo } from "@/components/logo";
import { pillOverhang, TicketPill } from "@/components/ticket-pill";
import { formAnchor } from "@/app/wishlist/form";

/** Da quanti px di scroll le lettere si ritirano e resta il simbolo. */
const COLLAPSE_AT = 120;

/** Il form a cui porta «Iscriviti»: quello in fondo alla pagina. */
const BOTTOM_FORM = formAnchor("immagina");

const subscribe = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
};
// Un booleano: React ridisegna solo quando si passa la soglia, non a ogni
// evento di scroll. Sul server, e prima dell'idratazione, il logo è intero.
const useCollapsed = () =>
  useSyncExternalStore(
    subscribe,
    () => window.scrollY > COLLAPSE_AT,
    () => false,
  );

/**
 * Fino al form scorrendo, non con un salto (se il movimento non è ridotto).
 * Senza JavaScript resta il link all'ancora, che ci arriva lo stesso.
 */
function scrollToForm(event: MouseEvent<HTMLAnchorElement>) {
  const target = document.getElementById(BOTTOM_FORM);
  if (!target) return;
  event.preventDefault();
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "center" });
}

/**
 * La barra in alto della landing, fissa e alta 64px, col logo a sinistra a
 * ogni larghezza (allineato alla colonna delle sezioni).
 *
 * Come su typeform.com: scorrendo, le lettere scivolano a sinistra dentro un
 * riquadro che le taglia e spariscono dietro il simbolo, che resta; tornando
 * in cima rientrano. Al loro posto, appena spariscono, sale dal fondo della
 * barra, in alto a destra, il bottone «Iscriviti» (ease-in), che porta al
 * form in fondo alla pagina; tornando in cima scende prima lui, poi
 * rientrano le lettere.
 *
 * In cima la barra è trasparente e il logo sta sul bordeaux dell'intestazione
 * come prima; quando le lettere si ritirano prende un fondo scuro, perché
 * sotto passano anche le sezioni chiare, dove il simbolo bianco sparirebbe.
 */
export function Navbar() {
  const collapsed = useCollapsed();

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-16 border-b transition-[background-color,border-color,backdrop-filter] duration-300 motion-reduce:transition-none ${
        collapsed
          ? "border-white/10 bg-ink/85 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className={`${WRAP} flex h-full items-center justify-between`}>
        <Link
          href="/"
          aria-label="Rysonance, torna all'inizio"
          className="flex items-center text-white [--logo-h:1.75rem] lg:[--logo-h:2.25rem]"
          style={{ "--logo-gap": LETTERS_GAP } as CSSProperties}
        >
          <Logo part="mark" className="h-(--logo-h) w-auto shrink-0" />
          <span className="ml-[calc(var(--logo-h)*var(--logo-gap))] overflow-hidden">
            <Logo
              part="letters"
              className={`block h-(--logo-h) w-auto transition-transform duration-300 ease-in-out motion-reduce:transition-none ${
                collapsed ? "-translate-x-full" : "translate-x-0 delay-200"
              }`}
            />
          </span>
        </Link>

        {/*
          * In alto a destra, in un riquadro alto quanto la barra che lo taglia
          * in fondo: il bottone ci sale da sotto. Il margine negativo è lo
          * spazio dei pallini oltre la forma, così il bordo del bottone cade
          * sul margine destro della colonna. Nascosto è `inert`, fuori dal tab
          * e dai lettori di schermo.
          */}
        <div
          inert={!collapsed}
          className="flex h-full items-center overflow-hidden"
          style={{ marginRight: -pillOverhang("s") }}
        >
          <TicketPill
            size="s"
            href={`#${BOTTOM_FORM}`}
            onClick={scrollToForm}
            className={`transition-[translate,opacity] motion-reduce:transition-none ${
              collapsed
                ? "translate-y-0 opacity-100 delay-300 duration-340 ease-in"
                : "translate-y-12 opacity-0 duration-200 ease-out"
            }`}
          >
            Iscriviti
          </TicketPill>
        </div>
      </div>
    </header>
  );
}
