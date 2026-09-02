/**
 * Modulo normale, senza direttive: la validazione serve sia alla Server Action
 * (per fidarsi dell'input) sia alla pagina (per non stampare in conferma un
 * indirizzo arrivato da una URL costruita a mano). Non può stare in
 * `actions.ts` perché un file `"use server"` esporta solo funzioni async.
 *
 * Regex volutamente permissiva (un `local@dominio.tld` ben formato): validare
 * davvero un indirizzo significa mandarci una mail, non farlo combaciare con
 * una grammatica. Serve solo a scartare gli errori di battitura evidenti.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

// 254 = limite di lunghezza di un indirizzo (RFC 5321): oltre, è spazzatura.
export function isValidEmail(email: string): boolean {
  return email.length > 0 && email.length <= 254 && EMAIL.test(email);
}
