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
