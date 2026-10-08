"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const subscribeToNothing = () => () => {};

function useHydrated() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();

  const isDark = hydrated && resolvedTheme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      className={cn("grid place-items-center overflow-hidden", className)}
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Moon
        aria-hidden="true"
        className="col-start-1 row-start-1 size-5 rotate-0 transition-transform duration-200 dark:hidden"
      />
      <Sun
        aria-hidden="true"
        className="col-start-1 row-start-1 hidden size-5 -rotate-90 transition-transform duration-200 dark:block dark:rotate-0"
      />
    </Button>
  );
}
