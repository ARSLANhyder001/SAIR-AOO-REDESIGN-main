import { Suspense } from "react";
import Link from "next/link";
import styles from "../page.module.css";
import { PropertyCard, SiteFooter, SiteHeader } from "../site-components";
import { getPublicListings } from "../lib/listings";

export const metadata = {
  title: "Properties for sale and rent in Hyderabad",
  description:
    "Browse published homes, plots and other properties from SAIR Construction & Real Estate in Hyderabad, Pakistan.",
  ...(process.env.NEXT_PUBLIC_SITE_URL
    ? { alternates: { canonical: "/properties" } }
    : {}),
  openGraph: {
    title: "Properties for sale and rent in Hyderabad | SAIR",
    description:
      "Browse published homes, plots and other properties from SAIR Construction & Real Estate in Hyderabad, Pakistan.",
    type: "website",
  },
};

function readText(value, maxLength = 80) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function readPrice(value) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

async function PropertiesResults({ searchParams }) {
  const params = await searchParams;
  const city = readText(params.city);
  const purpose =
    params.purpose === "sale" || params.purpose === "rent"
      ? params.purpose
      : undefined;
  const propertyType = readText(params.type, 60);
  const minPrice = readPrice(params.minPrice);
  const maxPrice = readPrice(params.maxPrice);
  const { data, error } = await getPublicListings({
    city,
    purpose,
    propertyType,
    minPrice,
    maxPrice,
  });

  if (error) console.error("Could not load public properties:", error.message);

  return (
    <>
      <section className={styles.listingIntro}>
        <div className={styles.eyebrow}><span /> SAIR PROPERTY COLLECTION</div>
        <h1>Find a place that <span>feels right.</span></h1>
        <p>Explore available homes, plots and properties in Hyderabad and beyond.</p>
      </section>

      <form className={styles.filterForm} action="/properties">
        <label>
          City
          <input name="city" placeholder="e.g. Hyderabad" defaultValue={city} />
        </label>
        <label>
          Listing
          <select name="purpose" defaultValue={purpose || ""}>
            <option value="">Sale or rent</option>
            <option value="sale">For sale</option>
            <option value="rent">For rent</option>
          </select>
        </label>
        <label>
          Property type
          <input name="type" placeholder="House, plot..." defaultValue={propertyType} />
        </label>
        <label>
          Minimum price
          <input name="minPrice" type="number" min="0" inputMode="numeric" defaultValue={minPrice} />
        </label>
        <label>
          Maximum price
          <input name="maxPrice" type="number" min="0" inputMode="numeric" defaultValue={maxPrice} />
        </label>
        <button type="submit" className={styles.filterButton}>Search properties</button>
        {(city || purpose || propertyType || minPrice !== undefined || maxPrice !== undefined) && (
          <Link className={styles.clearFilters} href="/properties">Clear filters</Link>
        )}
      </form>

      <section className={styles.propertyResults} aria-live="polite">
        <div className={styles.resultsHeading}>
          <h2>Available properties</h2>
          {data && <span>{data.length} results</span>}
        </div>
        {error ? (
          <p className={styles.listingNotice}>
            Properties could not be loaded right now. Please try again later.
          </p>
        ) : data?.length ? (
          <div className={styles.propertyGrid}>
            {data.map((listing) => <PropertyCard key={listing.id} listing={listing} />)}
          </div>
        ) : (
          <p className={styles.listingNotice}>
            No matching properties are currently published. Try different filters or check back soon.
          </p>
        )}
      </section>
    </>
  );
}

export default function PropertiesPage({ searchParams }) {
  return (
    <main className={styles.listingPage}>
      <SiteHeader />
      <Suspense fallback={<section className={styles.propertyResults} aria-busy="true">Loading properties…</section>}>
        <PropertiesResults searchParams={searchParams} />
      </Suspense>
      <SiteFooter />
    </main>
  );
}
