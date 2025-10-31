import { z } from 'zod';

export const enquirySchema = z.object({
    id: z.string().optional(),
    userId: z.string().optional(),
    projectId: z.string(),
    createdAt: z.date().default(() => new Date()),
});

export type Enquiry = z.infer<typeof enquirySchema>;
export const enquiryArraySchema = z.array(enquirySchema);
export type EnquiryArray = z.infer<typeof enquiryArraySchema>;

// sql table definition
/*
CREATE TABLE enquiries (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    project_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES house_projects(id)
);
*/