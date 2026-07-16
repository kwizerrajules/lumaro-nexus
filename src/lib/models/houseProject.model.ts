import { HouseProject, HouseProjectSchema } from "../../../src/schemas/house.projects.schema";
import { v4 as uuidv4 } from "uuid";
import getClientPromise from "../mongodb";
import { buildPlanSlug } from "../../../utils/slug";

const COLLECTION_NAME = "house_projects";
const DB_NAME = "LUMARO";

async function getHouseProjectsCollection() {
  const client = await getClientPromise();
  const db = client.db(DB_NAME);
  return db.collection<HouseProject & { _id: string }>(COLLECTION_NAME);
}

function mapDoc(document: HouseProject & { _id: string }): HouseProject {
  const { _id, ...rest } = document;
  return { id: _id, ...rest } as HouseProject;
}

async function isSlugTaken(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const collection = await getHouseProjectsCollection();
  const query: Record<string, unknown> = { slug };
  if (excludeId) query._id = { $ne: excludeId };
  const existing = await collection.findOne(query, { projection: { _id: 1 } });
  return !!existing;
}

async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const candidate = buildPlanSlug(title);
    if (!(await isSlugTaken(candidate, excludeId))) {
      return candidate;
    }
  }
  // Extremely unlikely collision path
  return buildPlanSlug(`${title}-${Date.now()}`);
}

/** Persist a slug when missing; keep existing slug stable. */
async function ensureDocumentSlug(
  document: HouseProject & { _id: string }
): Promise<HouseProject> {
  if (document.slug && typeof document.slug === "string" && document.slug.length >= 3) {
    return mapDoc(document);
  }

  const collection = await getHouseProjectsCollection();
  const slug = await generateUniqueSlug(document.title || "plan", document._id);
  await collection.updateOne(
    { _id: document._id },
    { $set: { slug, updatedAt: new Date().toISOString() } }
  );

  return mapDoc({ ...document, slug });
}

export const HouseProjectModel = {
  async create(data: HouseProject): Promise<HouseProject> {
    const parsed = HouseProjectSchema.parse(data);
    const _id = parsed.id || uuidv4();
    const now = new Date();

    const slug =
      parsed.slug && !(await isSlugTaken(parsed.slug))
        ? parsed.slug
        : await generateUniqueSlug(parsed.title, _id);

    const newDocument = {
      ...parsed,
      slug,
      _id,
      createdAt: now,
      updatedAt: now,
    };
    delete (newDocument as any).id;

    const collection = await getHouseProjectsCollection();
    await collection.insertOne(newDocument as any);

    return {
      ...parsed,
      slug,
      id: _id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  },

  async getById(id: string): Promise<HouseProject | null> {
    const collection = await getHouseProjectsCollection();
    const document = await collection.findOne({ _id: id });
    if (!document) return null;
    return ensureDocumentSlug(document as HouseProject & { _id: string });
  },

  /** Resolve by SEO slug first, then by Mongo `_id` (legacy / admin). */
  async getBySlugOrId(slugOrId: string): Promise<HouseProject | null> {
    if (!slugOrId) return null;
    const collection = await getHouseProjectsCollection();

    let document = await collection.findOne({ slug: slugOrId });
    if (!document) {
      document = await collection.findOne({ _id: slugOrId });
    }
    if (!document) return null;

    return ensureDocumentSlug(document as HouseProject & { _id: string });
  },

  async getAll(options?: {
    limit?: number;
    offset?: number;
    status?: string;
    category?: string;
    style?: string;
    search?: string;
  }): Promise<{ data: HouseProject[]; total: number }> {
    const { limit = 10, offset = 0, status, category, style, search } = options || {};

    const collection = await getHouseProjectsCollection();
    const query: any = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (style) query.style = style;

    if (search && search.trim()) {
      const raw = search.trim();
      const bedMatch = raw.match(/(\d+)\s*(bed|bedroom|bedrooms|br)\b/i);
      const bathMatch = raw.match(/(\d+)\s*(bath|bathroom|bathrooms|ba)\b/i);

      if (bedMatch) query.bedrooms = Number(bedMatch[1]);
      if (bathMatch) query.bathrooms = Number(bathMatch[1]);

      const textPart = raw
        .replace(/\d+\s*(bed|bedroom|bedrooms|br)\b/gi, "")
        .replace(/\d+\s*(bath|bathroom|bathrooms|ba)\b/gi, "")
        .trim();

      if (textPart) {
        const escaped = textPart.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = { $regex: escaped, $options: "i" };
        query.$or = [
          { title: regex },
          { description: regex },
          { location: regex },
          { category: regex },
          { style: regex },
          { type: regex },
          { status: regex },
          { slug: regex },
        ];
      }
    }

    const total = await collection.countDocuments(query);

    const documents = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    const data = await Promise.all(
      documents.map((doc) =>
        ensureDocumentSlug(doc as HouseProject & { _id: string })
      )
    );

    return { data, total };
  },

  async update(id: string, data: Partial<HouseProject>): Promise<void> {
    const collection = await getHouseProjectsCollection();
    const now = new Date();

    // Resolve slug → id so admin/API can patch by either key
    const existing = await this.getBySlugOrId(id);
    if (!existing) throw new Error("Project not found");
    const realId = existing.id;

    const patch = { ...data } as Record<string, unknown>;
    delete patch.id;
    // Slug is stable once set — ignore client overwrites; backfill if missing
    delete patch.slug;
    if (!existing.slug) {
      patch.slug = await generateUniqueSlug(existing.title || "plan", realId);
    }

    const result = await collection.updateOne(
      { _id: realId },
      { $set: { ...patch, updatedAt: now.toISOString() } }
    );

    if (result.matchedCount === 0) {
      throw new Error("Project not found");
    }
  },

  async delete(id: string): Promise<void> {
    const collection = await getHouseProjectsCollection();
    const existing = await this.getBySlugOrId(id);
    if (!existing) {
      throw new Error("Project not found or already deleted");
    }

    const result = await collection.deleteOne({ _id: existing.id });
    if (result.deletedCount === 0) {
      throw new Error("Project not found or already deleted");
    }
  },
};
