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
import { createHmac } from "node:crypto";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

// 254 = limite di lunghezza di un indirizzo (RFC 5321): oltre, è spazzatura.
export function isValidEmail(email: string): boolean {
  return email.length > 0 && email.length <= 254 && EMAIL.test(email);
}

/**
 * L'invio passa da un webhook n8n protetto con JWT Auth: n8n verifica la firma
 * di un `Authorization: Bearer <token>` contro un secret condiviso. Il token lo
 * firmiamo a ogni richiesta invece di tenerne uno long-lived in env — se una
 * copia finisce in un log resta spendibile per un minuto, non per sempre.
 */
const TOKEN_TTL_SECONDS = 60;

function base64url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

/**
 * HS256 a mano: un JWT firmato è due segmenti base64url più un HMAC, e tirarsi
 * in casa `jose` o `jsonwebtoken` per questo vorrebbe dire una dipendenza in più
 * da tenere aggiornata. L'algoritmo deve combaciare con quello scelto nella
 * credenziale JWT Auth su n8n.
 */
function signJwt(secret: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: "rysonance-landing",
      iat: now,
      exp: now + TOKEN_TTL_SECONDS,
    }),
  );
  const signature = createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

export async function sendWelcomeEmail(to: string) {
  const url = process.env.N8N_EMAIL_WEBHOOK_URL;
  const secret = process.env.N8N_JWT_SECRET;

  // Meglio fermarsi sulla configurazione mancante che sparare una richiesta
  // senza credenziali e ritrovarsi un 403 di cui non si capisce il motivo.
  if (!url || !secret) {
    throw new Error(
      "sendWelcomeEmail: N8N_EMAIL_WEBHOOK_URL o N8N_JWT_SECRET non configurati",
    );
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${signJwt(secret)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: to }),
    // Senza timeout la Server Action resta appesa quanto ci mette n8n a
    // rispondere, e chi si è iscritto guarda un form che gira.
    signal: AbortSignal.timeout(10_000),
  });

  // Il body serve nei log: n8n ci scrive il motivo del rifiuto (firma non
  // valida, token scaduto, workflow in errore), lo status da solo no.
  if (!res.ok) {
    throw new Error(`n8n ${res.status}: ${(await res.text()).slice(0, 500)}`);
  }
}
