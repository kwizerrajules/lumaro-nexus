import crypto from "crypto";
import { Collection } from "mongodb";
import getClientPromise from "../mongodb";
import type { CreateCategoryInput, UpdateCategoryInput } from "../../schemas/category.schema";

export type Category = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type CategoryDocument = {
  _id: string;
  name: string;
  nameLower: string;
  createdAt: Date;
  updatedAt: Date;
};

const COLLECTION_NAME = "categories";
const DB_NAME = "LUMARO";

// Cache the full category list in memory so we don't hit MongoDB on every request.
// It is refreshed after CACHE_TTL_MS and invalidated immediately on any write.
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

type CategoryCache = {
  data: Category[] | null;
  expiresAt: number;
  inFlight: Promise<Category[]> | null;
};

// Stored on globalThis so the cache survives Next.js hot-reloads in development.
const globalForCategoryCache = globalThis as unknown as { __categoryCache?: CategoryCache };
const cache: CategoryCache =
  globalForCategoryCache.__categoryCache ??
  (globalForCategoryCache.__categoryCache = { data: null, expiresAt: 0, inFlight: null });

function invalidateCache() {
  cache.data = null;
  cache.expiresAt = 0;
  cache.inFlight = null;
}

async function getCategoriesCollection(): Promise<Collection<CategoryDocument>> {
  const client = await getClientPromise();
  const db = client.db(DB_NAME);
  return db.collection<CategoryDocument>(COLLECTION_NAME);
}

async function fetchAllFromDb(): Promise<Category[]> {
  const collection = await getCategoriesCollection();
  const docs = await collection.find({}).sort({ nameLower: 1 }).toArray();
  return docs.map(toCategory);
}

async function getAllCached(): Promise<Category[]> {
  const now = Date.now();
  if (cache.data && cache.expiresAt > now) {
    return cache.data;
  }

  // De-duplicate concurrent misses so only one DB query runs at a time.
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

function toCategory(doc: CategoryDocument): Category {
  return {
    id: doc._id,
    name: doc.name,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const CategoryModel = {
  async list(search?: string): Promise<Category[]> {
    // Served from the in-memory cache; searching filters the cached list
    // instead of querying MongoDB again.
    const all = await getAllCached();
    const term = search?.trim().toLowerCase();

    const filtered = term
      ? all.filter((c) => c.name.toLowerCase().includes(term))
      : all;

    return filtered.slice(0, 50);
  },

  // Force a fresh reload from the database on the next list() call.
  invalidateCache,

  async getById(id: string): Promise<Category | null> {
    const collection = await getCategoriesCollection();
    const doc = await collection.findOne({ _id: id });
    return doc ? toCategory(doc) : null;
  },

  async findByName(name: string): Promise<Category | null> {
    const collection = await getCategoriesCollection();
    const doc = await collection.findOne({ nameLower: name.trim().toLowerCase() });
    return doc ? toCategory(doc) : null;
  },

  async create(data: CreateCategoryInput): Promise<Category> {
    const collection = await getCategoriesCollection();
    const name = data.name.trim();
    const nameLower = name.toLowerCase();

    const existing = await collection.findOne({ nameLower });
    if (existing) {
      throw new Error("Category already exists");
    }

    const now = new Date();
    const doc: CategoryDocument = {
      _id: crypto.randomUUID(),
      name,
      nameLower,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(doc);
    invalidateCache();
    return toCategory(doc);
  },

  async update(id: string, data: UpdateCategoryInput): Promise<Category | null> {
    const collection = await getCategoriesCollection();
    const name = data.name.trim();
    const nameLower = name.toLowerCase();

    const conflict = await collection.findOne({
      nameLower,
      _id: { $ne: id },
    });
    if (conflict) {
      throw new Error("Category already exists");
    }

    const result = await collection.findOneAndUpdate(
      { _id: id },
      { $set: { name, nameLower, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    invalidateCache();
    return result ? toCategory(result) : null;
  },

  async remove(id: string): Promise<boolean> {
    const collection = await getCategoriesCollection();
    const result = await collection.deleteOne({ _id: id });
    invalidateCache();
    return result.deletedCount === 1;
  },
};
