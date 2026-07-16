import type { Metadata } from "next";
import { HouseProjectModel } from "@/src/lib/models/houseProject.model";
import PlanDetailClient from "./PlanDetailClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const project = await HouseProjectModel.getBySlugOrId(slug);
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
    const url = `https://lumaronexus.com/plans/${canonicalSlug}`;

    return {
      title: project.title,
      description:
        description ||
        `${project.title} — house plan from Lumaro Nexus. ${project.bedrooms ?? ""} bed · ${project.areaSqFt ?? ""} m².`,
      alternates: {
        canonical: url,
      },
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
  } catch {
    return {
      title: "House plan",
    };
  }
}

export default async function PlanDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <PlanDetailClient slug={slug} />;
}
