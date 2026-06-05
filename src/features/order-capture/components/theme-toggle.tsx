"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const theme = mounted ? (resolvedTheme === "dark" ? "dark" : "light") : undefined;

  function chooseTheme(nextTheme: "light" | "dark") {
    setTheme(nextTheme);
  }

  return (
    <div
      className="inline-flex gap-0.5 p-0.75 border border-border rounded-lg bg-surface"
      role="group"
      aria-label="Tema da interface"
      suppressHydrationWarning
    >
      <button
        type="button"
        aria-label="Ativar tema claro"
        aria-pressed={theme === "light"}
        title="Tema claro"
        onClick={() => chooseTheme("light")}
        style={{ touchAction: "manipulation" }}
        className="grid w-11 h-11 place-items-center border border-transparent rounded-md bg-transparent text-muted outline-none hover:bg-surface-raised hover:text-foreground focus-visible:border-brand focus-visible:shadow-(--focus) aria-pressed:bg-lime aria-pressed:text-brand-dark dark:aria-pressed:bg-cyan dark:aria-pressed:text-[#07172e]"
      >
        <SunMedium size={17} strokeWidth={2.4} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Ativar tema escuro"
        aria-pressed={theme === "dark"}
        title="Tema escuro"
        onClick={() => chooseTheme("dark")}
        style={{ touchAction: "manipulation" }}
        className="grid w-11 h-11 place-items-center border border-transparent rounded-md bg-transparent text-muted outline-none hover:bg-surface-raised hover:text-foreground focus-visible:border-brand focus-visible:shadow-(--focus) aria-pressed:bg-lime aria-pressed:text-brand-dark dark:aria-pressed:bg-cyan dark:aria-pressed:text-[#07172e]"
      >
        <MoonStar size={17} strokeWidth={2.4} aria-hidden="true" />
      </button>
    </div>
  );
}
