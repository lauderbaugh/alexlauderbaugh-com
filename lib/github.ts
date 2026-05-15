import { format, parseISO } from "date-fns";
import { SITE } from "./site";

export function editOnGithubUrl(sourcePath: string): string {
  const { owner, name, branch } = SITE.repo;
  return `https://github.com/${owner}/${name}/blob/${branch}/${sourcePath}`;
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), "MMM d, yyyy");
}
