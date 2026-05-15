"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Render a neutral label until mounted to avoid hydration mismatch.
  const label = !mounted ? "dark" : resolvedTheme === "dark" ? "light" : "dark";
  const target = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(target)}
      className="mono text-[11px] uppercase tracking-[0.14em] text-muted dark:text-d-muted hover:text-ink dark:hover:text-d-ink transition-colors"
      aria-label={mounted ? `Switch to ${target} mode` : "Toggle theme"}
      title={mounted ? `Switch to ${target} mode` : "Toggle theme"}
    >
      {label}
    </button>
  );
}
