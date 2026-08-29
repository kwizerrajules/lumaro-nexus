import type { Metadata } from 'next';
import { abs } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'House Plan Catalog',
  description:
    'Browse ready-made house plans for building in Rwanda — 2, 3 and 4 bedroom designs, bungalows and storey houses. Filter by bedrooms, size, style and budget, then order construction documents prepared for BPMIS and District One Stop Centre.',
  alternates: { canonical: abs('catalog') },
  openGraph: {
    title: 'House Plan Catalog | Lumaro Nexus',
    description:
      'Ready-made house plans for Rwanda — filter by bedrooms, size, style and budget.',
    url: abs('catalog'),
  },
};

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
