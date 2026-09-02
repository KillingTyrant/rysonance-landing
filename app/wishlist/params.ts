/**
 * `searchParams` dà `string | string[]` a seconda di quante volte la chiave
 * compare nella query: `?email=a&email=b` arriva come array. Le pagine ne
 * vogliono comunque una sola, quindi si prende la prima e si va avanti —
 * scartare l'intera richiesta perché qualcuno ha duplicato un parametro
 * significherebbe mostrare un errore al posto di una conferma.
 */
export function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}
