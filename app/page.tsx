import type { Metadata } from 'next';
import { HouseProjectModel } from '@/src/lib/models/houseProject.model';
import { toVisiblePlanCards, type PlanCardData } from '@/lib/planCard';
import { canonical } from '@/lib/seo';
import HomeClient from './HomeClient';

// Fresh render so crawlers get the hero + full plan grid in the HTML.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: canonical('/'),
};

export default async function HomePage() {
  let projects: PlanCardData[] = [];

  try {
    const { data } = await HouseProjectModel.getAll({ limit: 100, offset: 0 });
    projects = toVisiblePlanCards(data);
  } catch (err) {
    console.error('home: failed to load plans', err);
  }

  const heroImage = projects.find((p) => p.image)?.image ?? null;

  return <HomeClient initialProjects={projects} initialHeroImage={heroImage} />;
}
