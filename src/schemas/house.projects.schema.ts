import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

//Main House Project Schema

export const HouseProjectSchema = z.object({
  id: z.string().uuid().default(() => uuidv4()),
  title: z.string().min(1).max(255),
  /** SEO URL key: `{title-kebab}-{suffix}` e.g. modern-villa-a7k2x9 — stable once set */
  slug: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
    .optional(),
  description: z.string().min(1).max(10000),
  // Cloudinary secure_url values are longer than classic path URLs
  thumbnail: z.string().min(1).max(2048),
  additionalImages: z.array(z.string().max(2048)).optional(),
  status: z.string().min(1).max(100).optional(),
  rooms: z.number().int().min(0).optional(),
  height: z.number().positive().optional(),
  width: z.number().positive().optional(),
  areaSqFt: z.number().positive().optional(),
  location: z.string().min(1).max(255).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  floors: z.number().int().min(0).optional(),
  category: z.string().min(1).max(100).optional(),
  style: z.string().min(1).max(100).optional(),
  type: z.string().min(5).max(200).optional(),
  price: z.number().nonnegative().optional(),
  views: z.number().int().nonnegative().default(0).optional(),
  likes: z.number().int().nonnegative().default(0).optional(),
  createdAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }).optional(),
  updatedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }).optional(),
});

export type HouseProject = z.infer<typeof HouseProjectSchema>;
