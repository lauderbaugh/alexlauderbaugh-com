import type { MetadataRoute } from "next";
import { getAllLogEntries, getAllProjects } from "@/lib/content";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/log`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/books`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/principles`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const logEntries: MetadataRoute.Sitemap = getAllLogEntries().map((e) => ({
    url: `${base}/log/${e.slug}`,
    lastModified: new Date(e.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const projects: MetadataRoute.Sitemap = getAllProjects().map((p) => ({
    url: `${base}/projects/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...logEntries, ...projects];
}
