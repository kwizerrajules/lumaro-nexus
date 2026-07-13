import crypto from "crypto";
import { Collection } from "mongodb";
import getClientPromise from "../mongodb";
import { CategoryModel } from "./category.model";
import type { CreateStyleInput, UpdateStyleInput } from "../../schemas/style.schema";

export type Style = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
};

type StyleDocument = {
  _id: string;
  name: string;
  nameLower: string;
  categoryId: string;
  categoryName: string;
  createdAt: Date;
  updatedAt: Date;
};

const COLLECTION_NAME = "styles";
const DB_NAME = "LUMARO";

// In-memory cache of the full styles list to avoid querying MongoDB on every request.
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

type StyleCache = {
  data: Style[] | null;
  expiresAt: number;
  inFlight: Promise<Style[]> | null;
};

const globalForStyleCache = globalThis as unknown as { __styleCache?: StyleCache };
const cache: StyleCache =
  globalForStyleCache.__styleCache ??
  (globalForStyleCache.__styleCache = { data: null, expiresAt: 0, inFlight: null });

function invalidateCache() {
  cache.data = null;
  cache.expiresAt = 0;
  cache.inFlight = null;
}

async function getStylesCollection(): Promise<Collection<StyleDocument>> {
  const client = await getClientPromise();
  const db = client.db(DB_NAME);
  return db.collection<StyleDocument>(COLLECTION_NAME);
}

async function fetchAllFromDb(): Promise<Style[]> {
  const collection = await getStylesCollection();
  const docs = await collection.find({}).sort({ categoryName: 1, nameLower: 1 }).toArray();
  return docs.map(toStyle);
}

async function getAllCached(): Promise<Style[]> {
  const now = Date.now();
  if (cache.data && cache.expiresAt > now) {
    return cache.data;
  }

  if (!cache.inFlight) {
    cache.inFlight = fetchAllFromDb()
      .then((data) => {
        cache.data = data;
        cache.expiresAt = Date.now() + CACHE_TTL_MS;
        return data;
      })
      .finally(() => {
        cache.inFlight = null;
      });
  }

  return cache.inFlight;
}

function toStyle(doc: StyleDocument): Style {
  return {
    id: doc._id,
    name: doc.name,
    categoryId: doc.categoryId,
    categoryName: doc.categoryName,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const StyleModel = {
  async list(options?: {
    search?: string;
    categoryId?: string;
    categoryName?: string;
  }): Promise<Style[]> {
    // Served from the in-memory cache; all filtering happens in memory.
    const all = await getAllCached();

    const categoryName = options?.categoryName?.trim().toLowerCase();
    const term = options?.search?.trim().toLowerCase();

    const filtered = all.filter((s) => {
      if (options?.categoryId) {
        if (s.categoryId !== options.categoryId) return false;
      } else if (categoryName) {
        if (s.categoryName.toLowerCase() !== categoryName) return false;
      }
      if (term && !s.name.toLowerCase().includes(term)) return false;
      return true;
    });

    return filtered.slice(0, 100);
  },

  // Force a fresh reload from the database on the next list() call.
  invalidateCache,

  async create(data: CreateStyleInput): Promise<Style> {
    const collection = await getStylesCollection();
    const category = await CategoryModel.getById(data.categoryId);
    if (!category) {
      throw new Error("Parent category not found");
    }

    const name = data.name.trim();
    const nameLower = name.toLowerCase();

    const existing = await collection.findOne({
      categoryId: data.categoryId,
      nameLower,
    });
    if (existing) {
      throw new Error("Style already exists under this category");
    }

    const now = new Date();
    const doc: StyleDocument = {
      _id: crypto.randomUUID(),
      name,
      nameLower,
      categoryId: category.id,
      categoryName: category.name,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(doc);
    invalidateCache();
    return toStyle(doc);
  },

  async update(id: string, data: UpdateStyleInput): Promise<Style | null> {
    const collection = await getStylesCollection();
    const current = await collection.findOne({ _id: id });
    if (!current) return null;

    let categoryId = current.categoryId;
    let categoryName = current.categoryName;

    if (data.categoryId && data.categoryId !== current.categoryId) {
      const category = await CategoryModel.getById(data.categoryId);
      if (!category) {
        throw new Error("Parent category not found");
      }
      categoryId = category.id;
      categoryName = category.name;
    }

    const name = data.name?.trim() ?? current.name;
    const nameLower = name.toLowerCase();

    const conflict = await collection.findOne({
      categoryId,
      nameLower,
      _id: { $ne: id },
    });
    if (conflict) {
      throw new Error("Style already exists under this category");
    }

    const result = await collection.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          name,
          nameLower,
          categoryId,
          categoryName,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    invalidateCache();
    return result ? toStyle(result) : null;
  },

  async remove(id: string): Promise<boolean> {
    const collection = await getStylesCollection();
    const result = await collection.deleteOne({ _id: id });
    invalidateCache();
    return result.deletedCount === 1;
  },
};
