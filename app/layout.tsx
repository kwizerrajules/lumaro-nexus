import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
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
  title: "Maramani House Plans - Affordable African Designs",
  description: "Since 2014, providing affordable, African market-tailored house plans with premium construction documents and custom design options.",
};

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