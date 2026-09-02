# Template email

`welcome.html` è la mail di benvenuto della wishlist, quella che n8n manda quando
[app/wishlist/email.ts](../app/wishlist/email.ts) chiama il webhook.
`welcome.txt` è l'alternativa testuale: va allegata come `text/plain` insieme
all'HTML (multipart) — senza, diversi filtri antispam alzano il punteggio.

## Segnaposto

| Segnaposto          | Da dove viene                                              |
| ------------------- | ---------------------------------------------------------- |
| `{{email}}`         | il campo `email` del payload inviato al webhook             |
| `{{unsubscribeUrl}}`| **non esiste ancora**: né una route nell'app né un valore nel payload |

Se n8n usa la sintassi `{{ $json.email }}`, i segnaposto vanno riscritti di
conseguenza — sono due sostituzioni di testo.

## Da sistemare prima dell'invio

- **Dominio.** Il template punta a `https://rysonance.it` (logo e bottone). Il
  progetto non lo definisce da nessuna parte: va allineato al dominio vero.
- **Logo.** `src` è `https://rysonance.it/email/logo.png`, cioè
  [public/email/logo.png](../public/email/logo.png) una volta deployato. I
  client di posta non renderizzano SVG, quindi il PNG serve davvero;
  `logo.svg` accanto è il sorgente da cui rigenerarlo. È a 80×80 e viene
  mostrato a 40, per gli schermi retina.
- **Disiscrizione.** Il link nel footer è un segnaposto senza niente dietro.
  Per una mail transazionale singola è tollerabile, ma se la lista diventa una
  newsletter serve una route vera (e un header `List-Unsubscribe`).

## Perché è scritto così

Tabelle annidate, larghezze fisse e stili inline: Outlook renderizza con il
motore di Word (niente flex/grid, `padding` e `border-radius` ignorati su `<a>`
— da cui il blocco VML del bottone), e Gmail scarta il `<style>` nella app
mobile e sui messaggi inoltrati. Nel `<style>` resta solo ciò che inline non si
può scrivere: media query e dark mode, entrambe migliorie opzionali — chi non le
supporta vede la versione chiara, che è quella inline.

Modificando il file, provalo su Gmail (web e app), Outlook e Apple Mail prima di
metterlo in produzione: è l'unico modo per sapere com'è venuto.
