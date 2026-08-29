import type { Metadata } from 'next';
import { abs } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Request a Custom House Plan',
  description:
    'Brief a custom house plan for your plot in Rwanda. Share your land size, budget and needs and get a tailored design with construction documents prepared for BPMIS and District One Stop Centre approval.',
  alternates: { canonical: abs('custom-plan') },
  openGraph: {
    title: 'Request a Custom House Plan | Lumaro Nexus',
    description:
      'Tell us your plot, budget and needs — get a tailored house design and construction documents for Rwanda.',
    url: abs('custom-plan'),
  },
};

export default function CustomPlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
