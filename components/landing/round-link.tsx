"use client";

import type { MouseEvent, ReactNode } from "react";
import { pageTop } from "./page-top";
import styles from "./round-link.module.css";

/**
 * Quanto sopra il punto d'arrivo si ferma lo scorrimento: la barra fissa in
 * alto (64px) e un po' d'aria.
 */
const TOP_GAP = 96;

/**
 * Il bottone piccolo e tondo coi pallini (vedi `round-link.module.css`) che
 * porta a un punto più in basso della pagina, con uno scorrimento morbido.
 *
 * È un vero link (`#to`): senza JavaScript salta lì da solo. Col JavaScript
 * lo scorrimento lo fa la pagina, misurando l'arrivo con `pageTop` (le sezioni
 * impilate si rimpiccioliscono e `getBoundingClientRect` sbaglierebbe); con il
 * movimento ridotto il salto è immediato. All'arrivo il fuoco passa al punto
 * d'arrivo (che deve avere `tabIndex={-1}`), così da tastiera e coi lettori di
 * schermo si continua da lì.
 */
export function RoundLink({ to, children }: { to: string; children: ReactNode }) {
  const go = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(to);
    if (!target) return;
    event.preventDefault();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: Math.max(0, pageTop(target) - TOP_GAP),
      behavior: still ? "auto" : "smooth",
    });
    target.focus({ preventScroll: true });
  };

  return (
    <a href={`#${to}`} onClick={go} className={styles.pill}>
      {children}
    </a>
  );
}
