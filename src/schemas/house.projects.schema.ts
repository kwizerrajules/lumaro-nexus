import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

//Main House Project Schema

export const HouseProjectSchema = z.object({
  id: z.string().uuid().default(() => uuidv4()),
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(10000),
  thumbnail: z.string().min(1).max(255),
  additionalImages: z.array(z.string()).optional(),
  status: z.enum(["planned", "in-progress", "completed", "on-hold"]).default("planned"),
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
  views: z.number().int().nonnegative().default(0),
  likes: z.number().int().nonnegative().default(0),
  createdAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }).optional(),
  updatedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }).optional(),
});

export type HouseProject = z.infer<typeof HouseProjectSchema>;
