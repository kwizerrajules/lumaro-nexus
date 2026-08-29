import { cache } from "react";
import type { Metadata } from "next";
import { HouseProjectModel } from "@/src/lib/models/houseProject.model";
import {
  abs,
  canonical,
  jsonLdScript,
  planBreadcrumbJsonLd,
  planProductJsonLd,
} from "@/lib/seo";
import PlanDetailClient from "./PlanDetailClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** De-dupe the DB lookup between generateMetadata and the page render. */
const loadPlan = cache((slug: string) =>
  HouseProjectModel.getBySlugOrId(slug).catch(() => null),
);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const project = await loadPlan(slug);
  if (!project) {
    return {
      title: "Plan not found",
      robots: { index: false, follow: false },
    };
  }

  const description = (project.description || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  const canonicalSlug = project.slug || project.id;
  const url = abs(`plans/${canonicalSlug}`);

  return {
    title: project.title,
    description:
      description ||
      `${project.title} — house plan from Lumaro Nexus. ${project.bedrooms ?? ""} bed · ${project.areaSqFt ?? ""} m².`,
    alternates: canonical(`plans/${canonicalSlug}`),
    openGraph: {
      title: `${project.title} | Lumaro Nexus`,
      description:
        description || `View the ${project.title} house plan on Lumaro Nexus.`,
      url,
      type: "website",
      images: project.thumbnail
        ? [
            {
              url: project.thumbnail,
              alt: project.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: description || undefined,
      images: project.thumbnail ? [project.thumbnail] : undefined,
    },
  };
}

export default async function PlanDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await loadPlan(slug);

  return (
    <>
      {project ? (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={jsonLdScript(planProductJsonLd(project))}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={jsonLdScript(planBreadcrumbJsonLd(project))}
          />
        </>
      ) : null}
      <PlanDetailClient slug={slug} />
    </>
  );
}
