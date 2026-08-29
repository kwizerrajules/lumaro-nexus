import type { Metadata } from 'next';
import { canonical } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Lumaro Nexus — affordable house plans, custom designs, and professional construction documents from Kigali, Rwanda.',
  alternates: canonical('about'),
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
