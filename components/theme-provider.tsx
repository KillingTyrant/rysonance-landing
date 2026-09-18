"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Tema dal sistema operativo, applicato come classe `dark` su `<html>`: è da lì
 * che `globals.css` sceglie le variabili e che `HomeBackground` legge i colori
 * della griglia.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
