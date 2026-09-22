"use client";

import React, { useEffect, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("niyomi-theme");
  if (stored === "dark" || stored === "light") return stored;
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

export function ThemeToggle() {
  const isDark = useRef(false);

  useEffect(() => {
    const initial = getInitialTheme();
    isDark.current = initial === "dark";
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = () => {
    isDark.current = !isDark.current;
    document.documentElement.classList.toggle("dark", isDark.current);
    localStorage.setItem("niyomi-theme", isDark.current ? "dark" : "light");
    window.dispatchEvent(new Event("theme-change"));
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      )}
      aria-label="Toggle dark mode"
    >
      <Moon className="h-4 w-4 dark:hidden" />
      <Sun className="h-4 w-4 hidden dark:block" />
    </button>
  );
}
