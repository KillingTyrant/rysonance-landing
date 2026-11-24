/**
 * La colonna dei layout: 960px di contenuto a 1440 (60rem, vedi la scala in
 * globals.css), con 20px di margine quando lo schermo è più stretto.
 */
export const WRAP = "mx-auto w-full max-w-[62.5rem] px-5";

/**
 * Da aggiungere a WRAP nelle sezioni che sul telefono sono una colonna sola e
 * da tablet (`md`) si aprono come su desktop (le domande frequenti e
 * l'iscrizione in fondo). Sul telefono stretto non cambia nulla; fino al
 * tablet la colonna resta larga quanto il form (28rem, il `max-w-md`
 * dell'intestazione) e centrata, invece di lasciare i blocchi appoggiati a
 * sinistra e mezza finestra vuota. I 2,5rem in più sono il padding di WRAP.
 */
export const NARROW = "max-md:max-w-[30.5rem]";
