"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { useTheme } from "next-themes";

const ICON_SIZE = 16;

/** Icone lucide (Sun, Moon, Laptop) riportate in SVG per non aggiungere la dipendenza. */
function Icona({ children }: { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const TEMI = [
  {
    value: "light",
    label: "Chiaro",
    icona: (
      <Icona>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </Icona>
    ),
  },
  {
    value: "dark",
    label: "Scuro",
    icona: (
      <Icona>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </Icona>
    ),
  },
  {
    value: "system",
    label: "Sistema",
    icona: (
      <Icona>
        <path d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z" />
        <path d="M20.054 15.987H3.946" />
      </Icona>
    ),
  },
] as const;

// Il bottone "ticketSmall" di rysonance-quest (vedi .btn-ticket-sm in globals.css).
const BOTTONE =
  "group relative inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 btn-ticket-sm text-[#f4f4f4] [--ticket-bg:#272727] [--ticket-border-width:0px] hover:text-[#272727] hover:[--ticket-bg:#f4f4f4] hover:[--ticket-border:#272727] hover:[--ticket-border-width:3px] active:text-[#f4f4f4] active:[--ticket-bg:#272727] active:[--ticket-border-width:0px]";

// I pallini che all'hover escono dalle due tacche laterali.
const PALLINO =
  "absolute top-1/2 h-[10px] w-[10px] -translate-y-1/2 rounded-full bg-[#272727] opacity-0 transition-all duration-800 ease-out group-hover:translate-x-0 group-hover:opacity-100";

const noop = () => () => {};

/**
 * Come il ThemeSwitcher di rysonance-quest, ma senza shadcn/radix: invece del menu,
 * ogni clic passa al tema successivo (Chiaro → Scuro → Sistema).
 */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  // Il tema scelto si conosce solo sul client: prima dell'idratazione stesso bottone,
  // senza icona, per non far cambiare l'altezza del footer quando compare quello vero.
  const idratato = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

  if (!idratato) {
    return (
      <button type="button" className={BOTTONE} disabled aria-hidden tabIndex={-1}>
        <span style={{ width: ICON_SIZE, height: ICON_SIZE }} />
      </button>
    );
  }

  const attuale = TEMI.find((t) => t.value === theme) ?? TEMI[2];
  const prossimo = TEMI[(TEMI.indexOf(attuale) + 1) % TEMI.length];

  return (
    <button
      type="button"
      className={BOTTONE}
      onClick={() => setTheme(prossimo.value)}
      aria-label={`Cambia tema (attuale: ${attuale.label})`}
      title={`Tema: ${attuale.label}`}
    >
      <span aria-hidden className={`${PALLINO} -left-[5px] translate-x-4`} />
      <span>{attuale.icona}</span>
      <span aria-hidden className={`${PALLINO} -right-[5px] -translate-x-4`} />
    </button>
  );
}
