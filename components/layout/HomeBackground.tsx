"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

import ShapeGrid from "@/components/layout/ShapeGrid";

/**
 * Colori della griglia per tema. Il canvas non legge le variabili CSS, quindi
 * stanno qui: lo scuro è la palette originale, il chiaro la sua controparte
 * tenue sullo sfondo bianco.
 */
const COLORI = {
  dark: { borderColor: "#2F293A", hoverFillColor: "#222" },
  light: { borderColor: "#E6E3EC", hoverFillColor: "#F1EEF5" },
} as const;

const noop = () => () => {};

/**
 * Sfondo fisso della home: la griglia a esagoni che scorre in diagonale, visibile
 * fino ai bordi (niente vignettatura).
 */
export function HomeBackground() {
  // Sul server `resolvedTheme` è sempre undefined, ma sul client next-themes lo
  // conosce già al primo render: usarlo subito farebbe divergere l'idratazione.
  // La griglia compare quindi solo dopo l'idratazione, già nei colori giusti.
  const { resolvedTheme } = useTheme();
  const idratato = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const colori = !idratato
    ? null
    : resolvedTheme === "dark"
      ? COLORI.dark
      : resolvedTheme === "light"
        ? COLORI.light
        : null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-20">
      {colori && (
        <ShapeGrid
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          shape="hexagon"
          hoverTrailAmount={0}
          vignetteColor={null}
          {...colori}
        />
      )}
    </div>
  );
}
