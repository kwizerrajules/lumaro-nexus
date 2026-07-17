import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

/** Empty string → undefined so `.optional()` fields work from forms. */
const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

/** 0 / NaN / empty → undefined for optional positive dimensions. */
const zeroToUndefined = (v: unknown) => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n === 0) return undefined;
  return n;
};

const optionalPositiveNumber = z.preprocess(
  zeroToUndefined,
  z.number().positive().optional()
);

const optionalNonEmptyString = z.preprocess(
  emptyToUndefined,
  z.string().min(1).max(255).optional()
);

const optionalCategoryString = z.preprocess(
  emptyToUndefined,
  z.string().min(1).max(100).optional()
);

const optionalTypeString = z.preprocess(
  emptyToUndefined,
  z.string().min(5).max(200).optional()
);

const optionalNonNegativeInt = z.preprocess((v) => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return undefined;
  return Math.trunc(n);
}, z.number().int().min(0).optional());

// Main House Project Schema
export const HouseProjectSchema = z.object({
  id: z
    .string()
    .uuid()
    .default(() => uuidv4()),
  title: z.string().min(1).max(255),
  /** SEO URL key: `{title-kebab}-{suffix}` e.g. modern-villa-a7k2x9 — stable once set */
  slug: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
    .optional(),
  description: z.string().min(1, "Description is required").max(10000),
  // Cloudinary secure_url values are longer than classic path URLs
  thumbnail: z.string().min(1).max(2048),
  additionalImages: z.array(z.string().max(2048)).optional(),
  status: z.preprocess(
    emptyToUndefined,
    z.string().min(1).max(100).optional()
  ),
  rooms: optionalNonNegativeInt,
  height: optionalPositiveNumber,
  width: optionalPositiveNumber,
  areaSqFt: optionalPositiveNumber,
  location: optionalNonEmptyString,
  bedrooms: optionalNonNegativeInt,
  bathrooms: optionalNonNegativeInt,
  floors: optionalNonNegativeInt,
  category: optionalCategoryString,
  style: optionalCategoryString,
  type: optionalTypeString,
  price: z.preprocess((v) => {
    if (v === "" || v === null || v === undefined) return 0;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
  }, z.number().nonnegative().optional()),
  views: z.number().int().nonnegative().default(0).optional(),
  likes: z.number().int().nonnegative().default(0).optional(),
  createdAt: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .optional(),
  updatedAt: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .optional(),
});

export type HouseProject = z.infer<typeof HouseProjectSchema>;
