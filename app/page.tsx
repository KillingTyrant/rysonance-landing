import { HomeBackground } from "@/components/layout/HomeBackground";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <div className="relative flex flex-col flex-1 items-center justify-center font-sans">
      <HomeBackground />
      <main className="flex flex-1 w-full flex-col items-center justify-center p-16 sm:items-start">
        <Logo iconOnly={false} className="w-full" />
      </main>
    </div>
  );
}
