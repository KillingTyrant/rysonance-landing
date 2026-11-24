/**
 * Le domande frequenti, scritte sulle ricerche di chi vuole iniziare a giocare
 * di ruolo da tavolo («come iniziare a giocare di ruolo», «come iniziare a
 * giocare a D&D»…). Testi dati dal team.
 *
 * Un elenco solo per tre posti: la sezione visibile (`faq-section.tsx`), i
 * dati strutturati della pagina (FAQPage, in `app/page.tsx`) e `llms.txt`.
 * Così testo visibile e dati non si separano (Google chiede che coincidano).
 * Una riga vuota (`\n\n`) nella risposta la divide in paragrafi.
 * Sta in un file a sé perché la sezione gira nel browser, e i valori di un
 * file `"use client"` non si leggono dal server.
 */
export const FAQS = [
  {
    question: "Come iniziare a giocare di ruolo da tavolo?",
    answer:
      "Iniziare a giocare di ruolo da tavolo con Rysonance è facilissimo. Basta avere un account, creare il proprio eroe e scegliere chi sarà il narratore della plotline scelta tra quelle gratuite o quelle a pagamento. A differenza degli altri giochi di ruolo non bisogna studiare per ore manuali e regole: l’app nativa al sistema di gioco ti accompagnerà e guiderà in ogni momento dell’avventura.",
  },
  {
    question: "Serve esperienza per giocare a Rysonance?",
    answer:
      "No. Rysonance è pensato principalmente per chi non ha mai giocato di ruolo e vorrebbe iniziare: il sistema di gioco è facile e intuitivo da imparare e resta profondo per chi gioca da anni.",
  },
  {
    question: "È un gioco di ruolo come Dungeons & Dragons?",
    answer:
      "Anche Rysonance è un gioco di ruolo da tavolo come Dungeons & Dragons: si gioca in gruppo e si vive un’avventura narrata insieme. Rysonance però è un gioco con una profonda tecnologia e attenzione al game design, dove il mondo di gioco è connesso e viene influenzato dalle azioni dei giocatori. Il mondo è vivo anche se giochi al tavolo con i tuoi amici!",
  },
  {
    question: "Si gioca al tavolo o online?",
    answer:
      "Puoi giocare sia al tavolo che online. Poter giocare in qualsiasi momento con i propri amici nonostante la distanza è sempre stata una delle nostre prerogative, così come alleggerire il carico di calcolo durante le sessioni al tavolo. Questo è possibile grazie a un’esperienza multipiattaforma su tablet, smartphone e computer.",
  },
  {
    question: "Cosa sono gli Eco?",
    answer:
      "Sono una delle meccaniche principali di Rysonance. Le azioni collettive di tutti i giocatori possono generare degli Eco nella trama magica: il mondo di gioco risponde con variazioni di trama, regolamento o con la generazione di nuove quest e oggetti.",
  },
  {
    question: "Fate utilizzo di intelligenza artificiale?",
    answer:
      "Rysonance nasce per valorizzare la creatività umana: per questo motivo non utilizziamo l’AI per generare alcun contenuto creativo o artistico. Tutte le illustrazioni, i testi e le interfacce sono prodotti interamente da professionisti del settore.\n\nImpieghiamo l’Intelligenza Artificiale unicamente come strumento tecnico e analitico dietro le quinte, per ottimizzare i flussi di programmazione dei nostri sviluppatori e per elaborare i dati di gioco.",
  },
  {
    question: "Qual è il team dietro Rysonance?",
    answer:
      "Rysonance è un gioco sviluppato e progettato da un team italiano chiamato KillingTyrant. All’interno del team si sono riuniti sviluppatori, designer, sceneggiatori e sound designer che sposano l’idea del progetto e credono nella sua evoluzione. Se volete saperne di più a riguardo, seguiteci sui social!",
  },
  {
    question: "Quando esce Rysonance?",
    answer:
      "Rysonance è in pre-alpha. Iscriviti alla wishlist per entrare in coda alle fasi di test e provalo in anteprima!",
  },
] as const;
