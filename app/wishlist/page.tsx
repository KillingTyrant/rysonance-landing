import { Logo } from "@/components/logo";
import { joinWishlist } from "./actions";
import { isValidEmail, normalizeEmail } from "./email";
import { first } from "./params";

const ERRORS: Record<string, string> = {
    empty: "Enter your email address.",
    invalid: "That doesn't look like a valid email address.",
    send: "Something went wrong on our side. Please try again.",
};

export default async function Wishlist({ searchParams }: PageProps<"/wishlist">) {
    const params = await searchParams;

    // L'indirizzo arriva dall'URL, quindi lo si ri-valida prima di stamparlo:
    // la conferma deve poter mostrare solo un indirizzo plausibile, non una
    // stringa qualsiasi infilata nella query da chi passa di lì.
    const joined = normalizeEmail(first(params.joined));
    const confirmed = isValidEmail(joined) ? joined : "";

    const error = ERRORS[first(params.error)] ?? "";

    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex flex-1 max-w-3xl w-full flex-col items-center justify-center  align-middle p-16 bg-white dark:bg-black sm:items-start">
                <Logo iconOnly={true} />
                {confirmed ? (
                    <Confirmation email={confirmed} />
                ) : (
                    <SignupForm email={first(params.email)} error={error} />
                )}
            </main>
        </div>
    );
}

function SignupForm({ email, error }: { email: string; error: string }) {
    return (
        <form action={joinWishlist} className="mt-10 w-full">
            <label
                htmlFor="email"
                className="block max-w-sm text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
                Aggiungi alla wishlist
            </label>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Ti invieremo un'email non appena Rysonance sarà pronto.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    defaultValue={email}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "email-error" : undefined}
                    className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:border-red-500 aria-[invalid=true]:focus:ring-red-500"
                />
                <button
                    type="submit"
                    className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:focus:ring-zinc-100 dark:focus:ring-offset-black"
                >
                    Avvisami
                </button>
            </div>

            <p
                id="email-error"
                className="mt-2 min-h-5 text-sm text-red-600 dark:text-red-400"
            >
                {error}
            </p>
        </form>
    );
}

function Confirmation({ email }: { email: string }) {
    return (
        <div className="mt-10 w-full">
            <div className="flex items-start gap-3">
                <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                        clipRule="evenodd"
                    />
                </svg>
                <div>
                    <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Sei nella lista
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Ti scriveremo a{" "}
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {email}
                        </span>{" "}
                        non appena ci sarà qualcosa da condividere.
                    </p>
                </div>
            </div>
        </div>
    );
}
