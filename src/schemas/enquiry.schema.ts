import { z } from 'zod';

export const enquirySchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  projectId: z.string().min(1),
  createdAt: z.coerce.date(),
});

export type Enquiry = z.infer<typeof enquirySchema>;
export const enquiryArraySchema = z.array(enquirySchema);
export type EnquiryArray = z.infer<typeof enquiryArraySchema>;
