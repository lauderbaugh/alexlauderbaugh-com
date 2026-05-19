"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { NAV, SITE } from "@/lib/site";
import { ThemeToggle } from "./theme-toggle";

const HOTKEYS: Record<string, string> = {
  h: "/",
  l: "/log",
  b: "/books",
  p: "/projects",
  r: "/principles",
  a: "/about",
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let pending = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "g" && !pending) {
        pending = true;
        timer = setTimeout(() => {
          pending = false;
          timer = null;
        }, 800);
        return;
      }
      if (pending) {
        const dest = HOTKEYS[e.key];
        if (dest) {
          router.push(dest);
          pending = false;
          if (timer) clearTimeout(timer);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      if (timer) clearTimeout(timer);
    };
  }, [router]);

  return (
    <header className="pt-10 sm:pt-14 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 sm:gap-6">
        <Link
          href="/"
          className="serif text-[17px] font-medium tracking-tight hover:text-accent dark:hover:text-d-accent transition-colors"
        >
          {SITE.name}
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-x-7">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={
                  "text-[14px] transition-colors " +
                  (active
                    ? "text-accent dark:text-d-accent"
                    : "text-muted dark:text-d-muted hover:text-ink dark:hover:text-d-ink")
                }
              >
                {item.label}
              </Link>
            );
          })}
          <span className="hidden sm:inline-block w-px h-3 bg-rule dark:bg-d-rule" />
          <ThemeToggle />
        </nav>
      </div>
      <p className="mono text-[12px] mt-6 text-muted dark:text-d-muted">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent dark:bg-d-accent mr-2 align-middle" />
        {SITE.whereLine}
      </p>
    </header>
  );
}
