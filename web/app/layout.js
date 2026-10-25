import "./globals.css";

export const metadata = {
  ...(process.env.NEXT_PUBLIC_SITE_URL
    ? {
        metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL),
        alternates: { canonical: "/" },
      }
    : {}),
  title: {
    default: "SAIR | Construction & Real Estate",
    template: "%s | SAIR",
  },
  description:
    "Find property, plan a build or improve your space with SAIR Construction & Real Estate in Hyderabad, Pakistan.",
  applicationName: "SAIR",
  keywords: [
    "SAIR",
    "real estate in Pakistan",
    "property in Hyderabad",
    "construction",
    "renovation",
    "interior design",
  ],
  openGraph: {
    title: "SAIR | Construction & Real Estate",
    description:
      "Property, construction and professional services—connected in one place.",
    siteName: "SAIR Construction & Real Estate",
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SAIR | Construction & Real Estate",
    description:
      "Property, construction and professional services—connected in one place.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
