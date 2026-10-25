import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import styles from "../../page.module.css";
import { SiteFooter, SiteHeader } from "../../site-components";
import {
  formatPrice,
  getPublicListing,
  listingImage,
} from "../../lib/listings";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function loadListing(id) {
  if (!uuidPattern.test(id)) return { data: null, error: null };
  return getPublicListing(id);
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data, error } = await loadListing(id);

  if (error) console.error("Could not load property metadata:", error.message);
  if (!data) return { title: "Property not found" };

  const description =
    data.description?.slice(0, 155) ||
    `${data.title}${data.city ? ` in ${data.city}` : ""} — view property details from SAIR.`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  return {
    title: `${data.title}${data.city ? ` in ${data.city}` : ""}`,
    description,
    ...(siteUrl ? { alternates: { canonical: `${siteUrl}/properties/${id}` } } : {}),
    openGraph: {
      title: data.title,
      description,
      type: "website",
      ...(listingImage(data) ? { images: [listingImage(data)] } : {}),
    },
  };
}

async function PropertyDetail({ params }) {
  const { id } = await params;
  const { data: listing, error } = await loadListing(id);

  if (error) {
    console.error("Could not load public property:", error.message);
    throw new Error("The property could not be loaded.");
  }
  if (!listing) notFound();

  const images = [...new Set([...(listing.images || []), listing.image_url].filter(Boolean))];
  const facts = [
    listing.property_type,
    listing.bedrooms ? `${listing.bedrooms} bedrooms` : null,
    listing.bathrooms ? `${listing.bathrooms} bathrooms` : null,
    listing.area_size ? `${listing.area_size} ${listing.area_unit || ""}`.trim() : null,
  ].filter(Boolean);
  const mapUrl =
    Number.isFinite(listing.lat) && Number.isFinite(listing.lng)
      ? `https://www.google.com/maps/search/?api=1&query=${listing.lat},${listing.lng}`
      : null;

  return (
    <>
      <div className={styles.detailBreadcrumb}>
        <Link href="/properties">Properties</Link><span>/</span>{listing.city || "Hyderabad"}
      </div>
      <article className={styles.propertyDetail}>
        <div className={styles.detailGallery}>
          {images.length ? images.slice(0, 5).map((image, index) => (
            <div className={styles.detailImage} key={image}>
              <Image
                src={image}
                alt={`${listing.title} photo ${index + 1}`}
                fill
                unoptimized
                priority={index === 0}
                sizes="(max-width: 620px) 100vw, 70vw"
              />
            </div>
          )) : (
            <div className={`${styles.detailImage} ${styles.detailImageFallback}`}>
              <span>SAIR</span>
            </div>
          )}
        </div>
        <div className={styles.detailContent}>
          <div className={styles.detailMain}>
            <div className={styles.eyebrow}><span /> {listing.purpose === "rent" ? "FOR RENT" : "FOR SALE"}</div>
            <h1>{listing.title}</h1>
            <p className={styles.detailLocation}>{[listing.address, listing.city].filter(Boolean).join(", ")}</p>
            <strong className={styles.detailPrice}>{formatPrice(listing.price, listing.purpose)}</strong>
            {facts.length > 0 && (
              <ul className={styles.detailFacts}>
                {facts.map((fact) => <li key={fact}>{fact}</li>)}
              </ul>
            )}
            {listing.description && (
              <section className={styles.detailSection}>
                <h2>About this property</h2>
                <p>{listing.description}</p>
              </section>
            )}
            {listing.features?.length > 0 && (
              <section className={styles.detailSection}>
                <h2>Features</h2>
                <ul className={styles.featureList}>
                  {listing.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
              </section>
            )}
            {mapUrl && (
              <a className={styles.mapLink} href={mapUrl} target="_blank" rel="noreferrer">
                View location on map ↗
              </a>
            )}
          </div>
          <aside className={styles.detailCta}>
            <h2>Interested in this property?</h2>
            <p>Continue in the SAIR app to contact the team and take the next step.</p>
            <Link className={styles.primaryButton} href="/#download">Get the SAIR app <span aria-hidden="true">↗</span></Link>
          </aside>
        </div>
      </article>
    </>
  );
}

export default function PropertyDetailPage({ params }) {
  return (
    <main className={styles.listingPage}>
      <SiteHeader />
      <Suspense fallback={<section className={styles.propertyResults} aria-busy="true">Loading property details…</section>}>
        <PropertyDetail params={params} />
      </Suspense>
      <SiteFooter />
    </main>
  );
}
