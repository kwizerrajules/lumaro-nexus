import type { Metadata } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import GoogleAnalytics from "@/components/GoogleAnalytics";

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
  metadataBase: new URL("https://lumaronexus.com"),

  title: {
    default: "Lumaro Nexus | House Plans for Rwanda",
    template: "%s | Lumaro Nexus",
  },

  description:
    "Lumaro Nexus is a Kigali-based house-plan platform: browse ready designs, request custom plans, and order construction documents prepared for Rwanda District One Stop Centre and BPMIS requirements. Sign in to manage enquiries and orders.",

  applicationName: "Lumaro Nexus",
  authors: [{ name: "Lumaro Nexus", url: "https://lumaronexus.com" }],
  creator: "Lumaro Nexus",
  publisher: "Lumaro Nexus",

  keywords: [
    "African house plans",
    "African home design",
    "modern African architecture",
    "Kenya house plans",
    "Ghana house plans",
    "Lumaro Nexus",
    "Nigeria house designs",
    "South Africa home plans",
    "2 bedroom house plan",
    "3 bedroom house plan",
    "modern bungalow plan",
    "duplex house plan",
    "small plot home design",
    "Rwanda house plans",
    "house design Rwanda",
    "modern house plans",
    "architectural design",
    "igishushanyo cy inzu",
    "inzu Rwanda",
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
    url: "https://lumaronexus.com",
    siteName: "Lumaro Nexus",
    locale: "en_US",
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

  alternates: {
    canonical: "https://lumaronexus.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${cormorant.variable}`}>
      <body className={`${outfit.className} font-sans antialiased`}>
        {children}
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
