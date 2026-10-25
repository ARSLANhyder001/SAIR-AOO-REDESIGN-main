import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import styles from "./page.module.css";
import { getPublicListings } from "./lib/listings";
import { PropertyCard, SiteFooter, SiteHeader } from "./site-components";

const services = [
  {
    number: "01",
    icon: "⌂",
    title: "Buy & sell",
    description:
      "Explore homes, plots and commercial spaces, or connect with people looking for your property.",
  },
  {
    number: "02",
    icon: "⌑",
    title: "Rent a place",
    description:
      "Find a place that fits your needs, with clear listing details and a simpler way to get started.",
  },
  {
    number: "03",
    icon: "▤",
    title: "Construction",
    description:
      "Bring residential and commercial projects to life with a team that supports you through the build.",
  },
  {
    number: "04",
    icon: "⌁",
    title: "Renovation",
    description:
      "Refresh, repair or rework your space with practical guidance from planning to finishing.",
  },
  {
    number: "05",
    icon: "＋",
    title: "Estimation & BOQ",
    description:
      "Get a clearer view of your project scope and costs before work begins.",
  },
  {
    number: "06",
    icon: "▧",
    title: "Legal & documentation",
    description:
      "Get support with property paperwork, documentation and the steps around a transaction.",
  },
  {
    number: "07",
    icon: "✳",
    title: "Interior design",
    description:
      "Make a space feel like yours with thoughtful design and finishing choices.",
  },
];

const androidUrl =
  process.env.NEXT_PUBLIC_ANDROID_APP_URL?.trim();
const iosUrl =
  process.env.NEXT_PUBLIC_IOS_APP_URL ||
  "https://apps.apple.com/pk/search?term=SAIR%20Construction%20Real%20Estate";

function StoreLinks({ light = false }) {
  return (
    <div className={`${styles.storeLinks} ${light ? styles.storeLinksLight : ""}`}>
      {androidUrl ? (
        <a className={styles.storeButton} href={androidUrl} target="_blank" rel="noreferrer">
          <span className={styles.storeIcon} aria-hidden="true">▶</span>
          <span><small>DOWNLOAD ON</small><strong>Uptodown</strong></span>
          <span className={styles.externalArrow} aria-hidden="true">↗</span>
        </a>
      ) : (
        <span className={styles.storeButton} aria-disabled="true">
          <span className={styles.storeIcon} aria-hidden="true">▶</span>
          <span><small>COMING SOON</small><strong>Uptodown</strong></span>
        </span>
      )}
      <a className={styles.storeButton} href={iosUrl} target="_blank" rel="noreferrer">
        <span className={styles.appleIcon} aria-hidden="true">●</span>
        <span><small>DOWNLOAD ON THE</small><strong>App Store</strong></span>
        <span className={styles.externalArrow} aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className={styles.phoneStage} aria-label="Preview of the SAIR mobile app">
      <div className={styles.orbit} />
      <div className={styles.floatTag}>
        <span className={styles.liveDot} />
        Property search, made simple
      </div>
      <div className={styles.phone}>
        <div className={styles.phoneNotch} />
        <div className={styles.phoneScreen}>
          <div className={styles.phoneStatus}><span>9:41</span><span>● ● ▰</span></div>
          <div className={styles.phoneTop}>
            <Image src="/sair-icon.png" alt="" width={38} height={38} priority />
            <div><span className={styles.phoneEyebrow}>SAIR REAL ESTATE</span><strong>Find your place.</strong></div>
            <span className={styles.avatar}>S</span>
          </div>
          <div className={styles.phoneSearch}><span>⌕</span>Search homes, plots, projects</div>
          <div className={styles.phoneHeading}><strong>Explore properties</strong><span>See all ↗</span></div>
          <div className={styles.phoneFilters}><span>All</span><span>Homes</span><span>Plots</span></div>
          <div className={styles.propertyPreview}>
            <div className={styles.propertyImage}>
              <span className={styles.imageLabel}>FOR SALE</span>
              <span className={styles.imageHeart}>♡</span>
              <div className={styles.houseIllustration}>
                <span className={styles.houseRoof} />
                <span className={styles.houseBody}><i /><i /><b /></span>
              </div>
            </div>
            <div className={styles.propertyInfo}>
              <strong>PKR 2.85 Crore</strong>
              <span>Modern family home</span>
              <small>⌖ Hyderabad · 4 bed · 10 marla</small>
            </div>
          </div>
          <div className={styles.phoneSectionTitle}>Services for every step</div>
          <div className={styles.miniServices}>
            <span><i>⌂</i>Buy & sell</span><span><i>▤</i>Build</span><span><i>✳</i>Design</span>
          </div>
          <div className={styles.phoneTabBar}><span>⌂<small>Home</small></span><span>⌕<small>Search</small></span><span>♡<small>Saved</small></span><span>☻<small>Account</small></span></div>
        </div>
      </div>
      <div className={styles.floatCard}>
        <span className={styles.floatCardIcon}>✓</span>
        <span><strong>One place for property</strong><small>Search · save · get in touch</small></span>
      </div>
    </div>
  );
}

async function FeaturedProperties() {
  await connection();
  const { data: featured, error } = await getPublicListings({
    featuredOnly: true,
    limit: 6,
  });

  if (error) console.error("Could not load featured properties:", error.message);

  return (
    <section className={styles.listingsSection}>
      <div className={styles.listingsIntro}>
        <div>
          <div className={styles.eyebrow}><span /> HAND-PICKED BY SAIR</div>
          <h2>Featured <span>properties.</span></h2>
        </div>
        <Link className={styles.inlineLink} href="/properties">View all properties <span aria-hidden="true">↗</span></Link>
      </div>
      {error ? (
        <p className={styles.listingNotice}>
          Featured properties are temporarily unavailable.{" "}
          <Link href="/properties">Browse available listings</Link>.
        </p>
      ) : featured?.length ? (
        <div className={styles.propertyGrid}>
          {featured.map((listing) => <PropertyCard key={listing.id} listing={listing} />)}
        </div>
      ) : (
        <p className={styles.listingNotice}>
          Featured homes and plots will appear here as SAIR selects them.{" "}
          <Link href="/properties">Browse all published properties</Link>.
        </p>
      )}
    </section>
  );
}

export default function Home() {
  return (
    <main className={styles.page}>
      <SiteHeader />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><span /> CONSTRUCTION & REAL ESTATE, CONNECTED</div>
          <h1>Find your place.<br /><span>Build what’s next.</span></h1>
          <p className={styles.heroText}>
            From discovering a home to planning a build, SAIR brings property and construction services together—so your next step feels a little simpler.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.textButton} href="/properties">Browse properties <span aria-hidden="true">↗</span></Link>
            <a className={styles.primaryButton} href="#download">Discover the SAIR app <span aria-hidden="true">↗</span></a>
            <a className={styles.textButton} href="#services">Explore our services <span aria-hidden="true">↓</span></a>
          </div>
          <div className={styles.heroFootnote}><span className={styles.avatarStack}><i>S</i><i>⌂</i><i>+</i></span><span>Property, projects and support—all in one place.</span></div>
        </div>
        <PhoneMockup />
        <div className={styles.heroGlow} />
      </section>

      <Suspense fallback={<section className={styles.listingsSection} aria-busy="true">Loading featured properties…</section>}>
        <FeaturedProperties />
      </Suspense>

      <section className={styles.trustStrip} aria-label="SAIR services">
        <span>YOUR NEXT MOVE, SUPPORTED</span>
        <div><i>⌂</i> Property <b>·</b> <i>▤</i> Construction <b>·</b> <i>✳</i> Design <b>·</b> <i>✓</i> Documentation</div>
      </section>

      <section id="services" className={styles.servicesSection}>
        <div className={styles.sectionIntro}>
          <div><div className={styles.eyebrow}><span /> A MORE CONNECTED EXPERIENCE</div><h2>More than a listing.<br /><span>A partner for what’s next.</span></h2></div>
          <p>Whether you’re finding a place or improving one, our services are designed to meet you at every stage.</p>
        </div>
        <div className={styles.serviceGrid}>
          {services.map((service) => (
            <article className={styles.serviceCard} key={service.number}>
              <div className={styles.serviceCardTop}><span className={styles.serviceIcon}>{service.icon}</span><span className={styles.serviceNumber}>{service.number}</span></div>
              <h3>{service.title}</h3><p>{service.description}</p><span className={styles.serviceArrow} aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className={styles.aboutSection}>
        <div className={styles.aboutMark}><span>SAIR</span><i>BUILD · BUY · BELONG</i></div>
        <div className={styles.aboutCopy}>
          <div className={styles.eyebrow}><span /> ROOTED IN HYDERABAD, PAKISTAN</div>
          <h2>Good decisions start<br />with <span>the right support.</span></h2>
          <p>SAIR Construction & Real Estate helps people explore property opportunities and move forward with construction, renovation and professional services.</p>
          <a className={styles.inlineLink} href="#download">Meet SAIR in the app <span aria-hidden="true">↗</span></a>
        </div>
        <div className={styles.aboutTexture} aria-hidden="true"><span /><span /><span /></div>
      </section>

      <section id="download" className={styles.downloadSection}>
        <div className={styles.downloadCopy}>
          <div className={styles.eyebrow}><span /> YOUR PROPERTY JOURNEY, IN YOUR POCKET</div>
          <h2>A simpler way<br />to take your <span>next step.</span></h2>
          <p>Explore listings, save the ones you love and connect with SAIR. Download the app to continue your property journey on mobile.</p>
          <StoreLinks light />
          <small className={styles.storeNote}>Choose your device to open the app store.</small>
        </div>
        <div className={styles.downloadVisual}><PhoneMockup /></div>
      </section>

      <SiteFooter />
    </main>
  );
}
