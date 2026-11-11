/**
 * Le tre scelte della campagna social («Qualcosa sta nascendo oltre i confini
 * delle mappe conosciute. Cosa fai?»), al posto dei tre riquadri del layout.
 *
 * Sono radio veri dentro delle `<label>`: la scelta si fa con mouse, tocco o
 * tastiera, e la carta scelta si evidenzia con `:has(:checked)` — niente
 * JavaScript, il componente resta lato server. Non stanno dentro un form e
 * non vengono inviati: sono un assaggio del gioco, non un dato da raccogliere.
 */
const CHOICES = [
  {
    key: "A",
    text: "Segui il sussurro nel bosco. Non vedi l'ora di capire dove porterà. Cosa mai potrebbe andare storto?",
    tint: "bg-[radial-gradient(130%_100%_at_100%_0%,#6b1a2c_0%,#2a1219_50%,#1e2029_100%)]",
  },
  {
    key: "B",
    text: "Raduni la compagnia, affili le armi e prepari un piano (ma sai già chi lo farà saltare).",
    tint: "bg-[radial-gradient(130%_100%_at_100%_0%,#6a4c12_0%,#2c2416_50%,#1e2029_100%)]",
  },
  {
    key: "C",
    text: "Io e la mia compagnia andremo in taverna a bere. Forse stavolta riusciremo a evitare la rissa.",
    tint: "bg-[radial-gradient(130%_100%_at_100%_0%,#34466b_0%,#1f2536_50%,#1e2029_100%)]",
  },
] as const;

export function ChoiceCards() {
  return (
    <fieldset className="group/choices">
      <legend className="text-[15px] leading-snug text-white/80">
        Qualcosa sta nascendo oltre i confini delle mappe conosciute.{" "}
        <span className="font-bold text-white">Cosa fai?</span>
      </legend>

      <div className="mt-6 grid gap-4 md:grid-cols-3 md:gap-5">
        {CHOICES.map((choice) => (
          <label
            key={choice.key}
            className={`relative flex min-h-64 cursor-pointer flex-col justify-between overflow-hidden rounded-[18px] border-2 border-white/5 p-5 transition duration-200 hover:border-white/30 has-[:checked]:border-gold has-[:checked]:shadow-[0_0_0_4px_rgb(250_181_19/0.15)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-white motion-safe:hover:-translate-y-0.5 md:min-h-80 ${choice.tint}`}
          >
            <input
              type="radio"
              name="cosa-fai"
              value={choice.key}
              className="peer sr-only"
            />
            {/* La lettera in grande, in filigrana: tiene il posto dell'illustrazione. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-3 -bottom-16 font-display text-[15rem] leading-none text-white/[0.06]"
            >
              {choice.key}
            </span>
            <span
              aria-hidden="true"
              className="relative grid size-10 place-items-center rounded-full border-2 border-white text-lg font-bold text-white transition-colors peer-checked:border-gold peer-checked:bg-gold peer-checked:text-ink"
            >
              {choice.key}
            </span>
            <span className="relative mt-10 text-xl leading-tight font-bold text-white md:text-lg lg:text-xl">
              <span className="sr-only">Risposta {choice.key}: </span>
              {choice.text}
            </span>
          </label>
        ))}
      </div>

      {/* Compare dopo la scelta: qualunque sia, il punto è che conta. */}
      <p
        aria-live="polite"
        className="mt-5 hidden text-[15px] leading-snug text-white/80 group-has-[:checked]/choices:block"
      >
        <span className="font-bold text-gold">Ottima scelta.</span> In
        Rysonance il mondo è influenzato dalle tue scelte e da quelle dei tuoi
        compagni.
      </p>
    </fieldset>
  );
}
