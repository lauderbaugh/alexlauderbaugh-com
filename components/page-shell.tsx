import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="view-enter max-w-[720px] mx-auto px-6 sm:px-8">
      {children}
    </div>
  );
}
