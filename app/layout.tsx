import type { Metadata } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import RegionNotice from "@/components/RegionNotice";
import {
  jsonLdScript,
  organizationJsonLd,
  webSiteJsonLd,
  SITE_GEO,
  SITE_URL,
} from "@/lib/seo";

import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Lumaro Nexus | House Plans for Rwanda",
    template: "%s | Lumaro Nexus",
  },

  description:
    "Lumaro Nexus is a Kigali-based house-plan platform: browse ready designs, request custom plans, and order construction documents prepared for Rwanda District One Stop Centre and BPMIS requirements. Sign in to manage enquiries and orders.",

  applicationName: "Lumaro Nexus",
  authors: [{ name: "Lumaro Nexus", url: SITE_URL }],
  creator: "Lumaro Nexus",
  publisher: "Lumaro Nexus",

  keywords: [
    "Lumaro Nexus",
    "Rwanda house plans",
    "house plans Kigali",
    "house design Rwanda",
    "construction drawings Rwanda",
    "BPMIS house plans",
    "One Stop Centre building permit plans",
    "2 bedroom house plan Rwanda",
    "3 bedroom house plan Rwanda",
    "4 bedroom house plan Rwanda",
    "modern bungalow plan",
    "duplex house plan",
    "small plot home design",
    "custom house plan Rwanda",
    "architectural design Kigali",
    "igishushanyo cy'inzu",
    "inyubako Rwanda",
  ],

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },

  openGraph: {
    type: "website",
    title: "Lumaro Nexus | House Plans for Rwanda",
    description:
      "Lumaro Nexus helps you browse and order house plans for Rwanda — ready catalog designs, custom briefs, and construction documents prepared for One Stop Centre and BPMIS.",
    url: SITE_URL,
    siteName: "Lumaro Nexus",
    locale: "en_RW",
    countryName: "Rwanda",
    images: [
      {
        url: "/brand/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Lumaro Nexus — House plans for Rwanda",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Lumaro Nexus | House Plans for Rwanda",
    description:
      "Clear construction documents prepared with Rwanda housing standards in mind — from Lumaro Nexus in Kigali.",
    images: ["/brand/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },

  // NOTE: no `alternates` here on purpose. Each route sets its own
  // self-referencing canonical via canonical() from lib/seo — a canonical on
  // the root layout would point every page at the homepage.

  // Geo signals — Bing/Yandex read these; Google infers region from content,
  // hreflang and the RW address in the structured data above.
  other: {
    "geo.region": "RW",
    "geo.placename": SITE_GEO.city,
    "geo.position": `${SITE_GEO.lat};${SITE_GEO.lng}`,
    ICBM: `${SITE_GEO.lat}, ${SITE_GEO.lng}`,
  },

  // Set GOOGLE_SITE_VERIFICATION in Vercel to the token from
  // Search Console → Settings → Ownership verification → HTML tag.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-RW" className={`${outfit.variable} ${cormorant.variable}`}>
      <body className={`${outfit.className} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(organizationJsonLd())}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(webSiteJsonLd())}
        />
        <RegionNotice />
        {children}
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
