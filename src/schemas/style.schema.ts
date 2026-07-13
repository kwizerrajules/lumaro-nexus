import { z } from "zod";

export const createStyleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Style name is required")
    .max(100, "Style name is too long"),
  categoryId: z.string().min(1, "Parent category is required"),
});

export const updateStyleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Style name is required")
    .max(100, "Style name is too long")
    .optional(),
  categoryId: z.string().min(1, "Parent category is required").optional(),
});

export type CreateStyleInput = z.infer<typeof createStyleSchema>;
export type UpdateStyleInput = z.infer<typeof updateStyleSchema>;
