"use client";

import { useEffect, useSyncExternalStore } from "react";

const THEME_KEY = "artsea-theme";
const THEME_CHANGE = "artsea-theme-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_CHANGE, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_CHANGE, callback);
  };
}

function getSnapshot(): boolean {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) return saved === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getServerSnapshot(): boolean | null {
  return null;
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore<boolean | null>(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (isDark === null) return;
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
  }, [isDark]);

  if (isDark === null) {
    return <div className="h-6 w-6" aria-hidden />;
  }

  const toggle = () => {
    const next = !isDark;
    localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    window.dispatchEvent(new Event(THEME_CHANGE));
  };

  return (
    <button
      onClick={toggle}
      className="group flex h-6 w-6 items-center justify-center cursor-pointer"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        className={`block rounded-full transition-all duration-300 ${
          isDark
            ? "h-3 w-3 bg-accent"
            : "h-3 w-3 border border-foreground/40 group-hover:border-foreground"
        }`}
      />
    </button>
  );
}
