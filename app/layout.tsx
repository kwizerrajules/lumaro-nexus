// "use client";

import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import MyCustomPlans from "@/components/MyCustomPlans";
import Header from "@/components/Header";

import "./globals.css";

// Initialize fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://your-domain.com"),

  title: {
    default: "Lumaro Nexus Architecture",
    template: "%s | Lumaro Nexus"
  },

  description: "Architectural design services, global house plans, custom home floor plans, and affordable building design solutions for residential and commercial clients.",

  keywords: [
  "African house plans",
  "African home design",
  "modern African architecture",
  "Kenya house plans",
  "Ghana house plans",
  "Nigeria house designs",
  "South Africa home plans",
  "2 bedroom house plan",
  "3 bedroom house plan",
  "modern bungalow plan",
  "duplex house plan",
  "small plot home design",
  "African house plans",
  "Rwanda house plans",
  "house design Rwanda",
  "modern house plans",
  "architectural design",
  "2 bedroom house plan",
  "3 bedroom house plan",
  "igishushanyo cy inzu",
  "inzu Rwanda"
],

  openGraph: {
    type: "website",
    title: "Lumaro Nexus Architecture and House Plans",
    description: "Explore modern house plans, custom architectural designs, and professional building documentation for global clients.",
    url: "https://your-domain.com",
    siteName: "Lumaro Nexus",
  },

  twitter: {
    card: "summary_large_image",
    title: "Lumaro Nexus Architecture",
    description: "Custom house plans, modern floor plans, and full architectural design services."
  },

  robots: {
    index: true,
    follow: true
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className="antialiased">
      
        {children}
      </body>
    </html>
  );
}