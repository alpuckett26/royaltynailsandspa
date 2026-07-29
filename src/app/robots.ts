import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/checkin", "/employee", "/schedule"],
    },
    sitemap: "https://royaltynailsandspa.com/sitemap.xml",
  };
}
