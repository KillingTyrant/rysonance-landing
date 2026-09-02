# Template email

`welcome.html` è la mail di benvenuto della wishlist, quella che n8n manda quando
[app/wishlist/email.ts](../app/wishlist/email.ts) chiama il webhook.
`welcome.txt` è l'alternativa testuale: va allegata come `text/plain` insieme
all'HTML (multipart) — senza, diversi filtri antispam alzano il punteggio.

`unsubscribed.html` / `unsubscribed.txt` sono la conferma di cancellazione: la
mail che chiude l'iscrizione. Stesso impianto del benvenuto, tre differenze —
il bottone rimanda a `/wishlist` per rimettersi in lista, il footer non ha il
link di disiscrizione (non ci sarebbe niente da disiscrivere) e l'unico
segnaposto è `{{email}}`.

## Segnaposto

| Segnaposto          | Da dove viene                                              |
| ------------------- | ---------------------------------------------------------- |
| `{{email}}`         | il campo `email` del payload inviato al webhook             |
| `{{unsubscribeUrl}}`| **non esiste ancora**: né una route nell'app né un valore nel payload (solo `welcome.html`/`welcome.txt`) |

Se n8n usa la sintassi `{{ $json.email }}`, i segnaposto vanno riscritti di
conseguenza — sono due sostituzioni di testo.

## Da sistemare prima dell'invio

- **Dominio.** I template puntano a `https://rysonancerpg.com` (logo e bottone).
  Il progetto non lo definisce da nessuna parte: se il dominio cambia, va
  cambiato a mano in ogni file.
- **Logo.** `src` è `https://rysonancerpg.com/email/logo.png`, cioè
  [public/email/logo.png](../public/email/logo.png) una volta deployato. I
  client di posta non renderizzano SVG, quindi il PNG serve davvero;
  `logo.svg` accanto è il sorgente da cui rigenerarlo. È a 80×80 e viene
  mostrato a 40, per gli schermi retina.
- **Disiscrizione.** `{{unsubscribeUrl}}` nel footer del benvenuto è ancora un
  segnaposto: manca il pezzo che rimuove davvero l'indirizzo. Esiste invece
  l'atterraggio, [app/wishlist/unsubscribed/page.tsx](../app/wishlist/unsubscribed/page.tsx)
  su `/wishlist/unsubscribed`, dove mandare l'utente **dopo** la rimozione
  (facoltativo `?email=<indirizzo>`, che la pagina ri-valida prima di
  stamparlo). Il flusso pensato è: link nel footer → chi rimuove
  l'indirizzo → redirect su quella pagina → `unsubscribed.html` per iscritto.
  Per una mail transazionale singola la mancanza è tollerabile, ma se la lista
  diventa una newsletter serve una route vera (e un header
  `List-Unsubscribe`).

## Perché è scritto così

Tabelle annidate, larghezze fisse e stili inline: Outlook renderizza con il
motore di Word (niente flex/grid, `padding` e `border-radius` ignorati su `<a>`
— da cui il blocco VML del bottone), e Gmail scarta il `<style>` nella app
mobile e sui messaggi inoltrati. Nel `<style>` resta solo ciò che inline non si
può scrivere: media query e dark mode, entrambe migliorie opzionali — chi non le
supporta vede la versione chiara, che è quella inline.

Modificando i file, provali su Gmail (web e app), Outlook e Apple Mail prima di
metterlo in produzione: è l'unico modo per sapere com'è venuto.
