import { z } from "zod";

export const createStaffSchema = z.object({
  id: z.string().uuid().optional(),
  names: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  role: z.enum(["SUPER_ADMIN","ADMIN","EDITOR","SUPPORT", "EXECUTIVE", "MANAGER"]),
  permissions: z.array(z.string()).optional(),
  avatarUrl: z.string().optional(),
  status: z.enum(["ACTIVE","SUSPENDED","PENDING"]).optional(),
});

export const updateStaffSchema = createStaffSchema.partial();

export const staffOutputSchema = createStaffSchema.omit({password: true});

export const updateStaffProfileSchema = z.object({
  names: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const changeStaffPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

