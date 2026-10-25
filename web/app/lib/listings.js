import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

export const PUBLIC_LISTING_COLUMNS = [
  "id",
  "kind",
  "title",
  "subtitle",
  "city",
  "description",
  "price",
  "image_url",
  "images",
  "bedrooms",
  "purpose",
  "bathrooms",
  "area_size",
  "area_unit",
  "category",
  "property_type",
  "address",
  "lat",
  "lng",
  "features",
  "floors",
  "year_built",
  "expires_at",
  "created_at",
  "is_featured",
  "agent_name",
  "agent_verified",
].join(",");

const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}

export async function getPublicListings({
  featuredOnly = false,
  city,
  purpose,
  propertyType,
  minPrice,
  maxPrice,
  kind = "property",
  limit = 48,
} = {}) {
  if (!configured) {
    return {
      data: null,
      error: new Error(
        "Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in web/.env.local.",
      ),
    };
  }

  let query = createServerClient()
    .from("listings")
    .select(PUBLIC_LISTING_COLUMNS)
    .eq("status", "published")
    .eq("kind", kind)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (featuredOnly) query = query.eq("is_featured", true);
  if (city) query = query.ilike("city", `%${city}%`);
  if (purpose) query = query.eq("purpose", purpose);
  if (propertyType) query = query.ilike("property_type", `%${propertyType}%`);
  if (minPrice !== undefined) query = query.gte("price", minPrice);
  if (maxPrice !== undefined) query = query.lte("price", maxPrice);

  const { data, error } = await query;
  return { data, error };
}

export const getPublicListing = cache(async (id) => {
  if (!configured) {
    return {
      data: null,
      error: new Error(
        "Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in web/.env.local.",
      ),
    };
  }

  const { data, error } = await createServerClient()
    .from("listings")
    .select(PUBLIC_LISTING_COLUMNS)
    .eq("id", id)
    .eq("kind", "property")
    .eq("status", "published")
    .maybeSingle();

  return { data, error };
});

export function listingImage(listing) {
  return listing.images?.[0] || listing.image_url || null;
}

export function formatPrice(price, purpose) {
  if (price === null || price === undefined) return "Price on request";
  const amount = `PKR ${Number(price).toLocaleString("en-PK")}`;
  return purpose === "rent" ? `${amount} / month` : amount;
}

export function propertyPath(listing) {
  return `/properties/${listing.id}`;
}
