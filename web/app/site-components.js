import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { formatPrice, listingImage, propertyPath } from "./lib/listings";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand} aria-label="SAIR home">
        <Image
          src="/sair-logo.png"
          alt="SAIR Construction"
          width={180}
          height={112}
          priority
        />
      </Link>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link href="/properties">Properties</Link>
        <Link href="/#services">Our services</Link>
        <Link href="/#about">About SAIR</Link>
      </nav>
      <Link className={styles.headerCta} href="/#download">
        Get the app <span aria-hidden="true">↗</span>
      </Link>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Link href="/" className={styles.footerBrand} aria-label="SAIR home">
        <Image src="/sair-logo.png" alt="SAIR Construction" width={138} height={86} />
      </Link>
      <span>Construction &amp; real estate, connected.</span>
      <div>
        <Link href="/properties">Properties</Link>
        <Link href="/#services">Services</Link>
        <Link href="/#download">Download app</Link>
      </div>
      <small>© SAIR Construction &amp; Real Estate</small>
    </footer>
  );
}

export function PropertyCard({ listing }) {
  const image = listingImage(listing);
  const facts = [
    listing.property_type,
    listing.bedrooms ? `${listing.bedrooms} bed` : null,
    listing.area_size ? `${listing.area_size} ${listing.area_unit || ""}`.trim() : null,
  ].filter(Boolean);

  return (
    <Link className={styles.propertyCard} href={propertyPath(listing)}>
      <div className={styles.propertyCardImage}>
        {image ? (
          <Image
            src={image}
            alt={listing.title}
            fill
            unoptimized
            sizes="(max-width: 620px) 100vw, (max-width: 900px) 50vw, 33vw"
          />
        ) : (
          <span className={styles.noImage}>SAIR</span>
        )}
        <span className={styles.propertyPurpose}>
          {listing.purpose === "rent" ? "FOR RENT" : "FOR SALE"}
        </span>
        {listing.is_featured && (
          <span className={styles.featuredBadge}>FEATURED</span>
        )}
      </div>
      <div className={styles.propertyCardBody}>
        <strong>{formatPrice(listing.price, listing.purpose)}</strong>
        <h2>{listing.title}</h2>
        <p>{[listing.city, ...facts].filter(Boolean).join(" · ")}</p>
      </div>
    </Link>
  );
}
