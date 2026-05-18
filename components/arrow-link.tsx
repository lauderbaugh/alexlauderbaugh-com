import type { ReactNode } from "react";
import { SmartLink } from "./smart-link";

interface ArrowLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function ArrowLink({ href, children, className = "" }: ArrowLinkProps) {
  return (
    <SmartLink
      href={href}
      className={
        "arrow-link inline-flex items-center gap-1.5 text-[14px] text-accent dark:text-d-accent hover:text-accent-hover dark:hover:text-d-accent-hover transition-colors " +
        className
      }
    >
      <span className="arrow">→</span>
      <span>{children}</span>
    </SmartLink>
  );
}
