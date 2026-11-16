import { Fragment } from "react";
import { SITE } from "@/lib/site";
import { getAllLogEntries } from "@/lib/content";
import { formatDate } from "@/lib/github";
import { SmartLink } from "./smart-link";

interface FooterProps {
  sourcePath?: string;
}

export function Footer({ sourcePath }: FooterProps) {
  const repo = SITE.repo;
  const editUrl = sourcePath
    ? `https://github.com/${repo.owner}/${repo.name}/blob/${repo.branch}/${sourcePath}`
    : null;
  // "Last updated" tracks the newest published log entry, so it moves when content does.
  const latest = getAllLogEntries()[0];

  return (
    <footer className="mt-24 pt-8 pb-14 border-t border-rule dark:border-d-rule">
      <p className="mono text-[12px] text-muted dark:text-d-muted">
        {SITE.location}
        {latest && <> · Last updated {formatDate(latest.date)}</>}
      </p>
      <p className="text-[13px] mt-2 text-muted dark:text-d-muted">
        {SITE.social.map((s, i) => (
          <Fragment key={s.label}>
            {i > 0 && <span className="mx-1.5 text-rule dark:text-d-rule">·</span>}
            <SmartLink href={s.href} className="link hover:text-ink dark:hover:text-d-ink">
              {s.label}
            </SmartLink>
          </Fragment>
        ))}
      </p>
      {editUrl && (
        <p className="mt-4">
          <SmartLink
            href={editUrl}
            className="arrow-link mono text-[12px] text-muted dark:text-d-muted hover:text-ink dark:hover:text-d-ink"
          >
            <span className="arrow">→</span> Edit this page on github
          </SmartLink>
        </p>
      )}
    </footer>
  );
}
