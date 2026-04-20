import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://demo.snnpathome.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/profile/", "/orders/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
