/**
 * Il telefono per gli effetti di scroll della landing: sotto il `md` di
 * Tailwind (48rem, 768px), la stessa soglia delle classi `md:`. Lì le
 * sezioni non si impilano (`slide-stack.tsx`) e «Esplora» scorre come una
 * sezione normale (`explore-section.tsx`); resta solo l'animazione del logo
 * nella barra in alto.
 */
export const PHONE = "(width < 48rem)";
