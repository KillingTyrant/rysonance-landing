/**
 * Il nome del campo esca, condiviso fra la pagina che lo disegna e l'action
 * che lo controlla: se i due si scollassero, l'action smetterebbe di scartare
 * i bot senza che niente lo segnali.
 *
 * L'underscore serve: i browser riempiono da soli i campi che riconoscono
 * (`name`, `organization`, `url`), e un utente vero a cui l'autofill compila
 * l'esca verrebbe scartato in silenzio. Nessuna euristica di autofill guarda
 * un nome così.
 */
export const HONEYPOT_FIELD = "_gotcha";
