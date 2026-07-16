import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Lumaro Nexus — affordable African house plans, custom designs, and professional construction documents from Kigali, Rwanda.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
