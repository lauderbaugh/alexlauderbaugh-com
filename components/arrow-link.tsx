import Link from "next/link";
import type { ReactNode } from "react";

interface ArrowLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}

export function ArrowLink({ href, children, className = "", external }: ArrowLinkProps) {
  const baseClasses =
    "arrow-link inline-flex items-center gap-1.5 text-[14px] text-accent dark:text-d-accent hover:text-accent-hover dark:hover:text-d-accent-hover transition-colors " +
    className;
  if (external) {
    return (
      <a href={href} className={baseClasses} target="_blank" rel="noreferrer">
        <span className="arrow">→</span>
        <span>{children}</span>
      </a>
    );
  }
  return (
    <Link href={href} className={baseClasses}>
      <span className="arrow">→</span>
      <span>{children}</span>
    </Link>
  );
}
