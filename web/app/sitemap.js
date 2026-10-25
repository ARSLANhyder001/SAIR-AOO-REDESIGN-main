import { getPublicListings, propertyPath } from "./lib/listings";
import { connection } from "next/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

export default async function sitemap() {
  if (!siteUrl) return [];
  await connection();

  const base = [
    {
      url: siteUrl,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/properties`,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
  const { data, error } = await getPublicListings({ limit: 1000 });
  if (error) {
    console.error("Could not load properties for sitemap:", error.message);
    return base;
  }

  return [
    ...base,
    ...data.map((listing) => ({
      url: `${siteUrl}${propertyPath(listing)}`,
      lastModified: listing.created_at,
      changeFrequency: "weekly",
      priority: listing.is_featured ? 0.8 : 0.6,
    })),
  ];
}
