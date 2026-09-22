import { ThemeSwitcher } from "@/components/theme-switcher";

/** Lo stesso footer di rysonance-quest, con la privacy e cookie policy iubenda di questo sito. */
export function Footer() {
  return (
    <footer className="w-full flex flex-wrap items-center justify-center border-t border-border mx-auto px-4 text-center text-xs font-sans bg-card/60 backdrop-blur-sm gap-4">
      <p>Powered by Rysonance all rights reserved. 2026</p>
      {/* suppressHydrationWarning: il widget iubenda in <head> modifica questi link
          (es. data-cmp-ab) prima dell'idratazione. */}
      <a
        href="https://www.iubenda.com/privacy-policy/23677761"
        className="iubenda-white iubenda-noiframe iubenda-embed hover:underline"
        title="Privacy Policy"
        suppressHydrationWarning
      >
        Privacy Policy
      </a>
      <a
        href="https://www.iubenda.com/privacy-policy/23677761/cookie-policy"
        className="iubenda-white iubenda-noiframe iubenda-embed hover:underline"
        title="Cookie Policy"
        suppressHydrationWarning
      >
        Cookie Policy
      </a>
      <ThemeSwitcher />
    </footer>
  );
}
