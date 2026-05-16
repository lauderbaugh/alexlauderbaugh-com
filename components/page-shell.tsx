import type { ReactNode } from "react";
import { Footer } from "./footer";

interface PageShellProps {
  children: ReactNode;
  sourcePath?: string;
  showBelt?: boolean;
}

export function PageShell({ children, sourcePath, showBelt }: PageShellProps) {
  return (
    <>
      <div className="view-enter max-w-[720px] mx-auto px-6 sm:px-8">
        {children}
      </div>
      <div className="max-w-[720px] mx-auto px-6 sm:px-8">
        <Footer sourcePath={sourcePath} showBelt={showBelt} />
      </div>
    </>
  );
}
