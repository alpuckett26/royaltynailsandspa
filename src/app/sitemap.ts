import type { MetadataRoute } from "next";

const BASE = "https://royaltynailsandspa.com";

// Public pages only — staff/admin surfaces are excluded via robots.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, priority: 1, changeFrequency: "weekly" },
    { url: `${BASE}/book`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE}/packages`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/about`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE}/contact`, priority: 0.6, changeFrequency: "monthly" },
  ];
}
