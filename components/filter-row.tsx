"use client";

import { Fragment } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterRowProps {
  options: FilterOption[];
  param?: string;
  defaultValue?: string;
}

export function FilterRow({ options, param = "filter", defaultValue = "all" }: FilterRowProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get(param) ?? defaultValue;

  const setFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === defaultValue) {
      params.delete(param);
    } else {
      params.set(param, value);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mono text-[12px] uppercase tracking-[0.14em]">
      {options.map((opt, i) => {
        const active = opt.value === current;
        return (
          <Fragment key={opt.value}>
            {i > 0 && <span className="text-rule dark:text-d-rule">·</span>}
            <button
              type="button"
              onClick={() => setFilter(opt.value)}
              className={
                "transition-colors " +
                (active
                  ? "text-accent dark:text-d-accent"
                  : "text-muted dark:text-d-muted hover:text-ink dark:hover:text-d-ink")
              }
            >
              {opt.label}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
