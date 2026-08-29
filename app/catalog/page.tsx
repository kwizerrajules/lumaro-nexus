import { HouseProjectModel } from '@/src/lib/models/houseProject.model';
import { toVisiblePlanCards, type PlanCardData } from '@/lib/planCard';
import CatalogClient from './CatalogClient';

// Render fresh so crawlers (and first-time visitors) get the full plan grid in
// the HTML. New admin uploads also appear immediately. The client component
// still does a background refresh for long-lived tabs.
export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  let projects: PlanCardData[] = [];

  try {
    const { data } = await HouseProjectModel.getAll({ limit: 200, offset: 0 });
    projects = toVisiblePlanCards(data);
  } catch (err) {
    console.error('catalog: failed to load plans', err);
  }

  return <CatalogClient initialProjects={projects} />;
}
