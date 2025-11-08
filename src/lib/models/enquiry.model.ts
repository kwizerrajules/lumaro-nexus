import { BaseModel } from '../../../src/lib/models/base.model';
import { enquirySchema, Enquiry } from '../../../src/schemas/enquiry.schema';
import db from '../db';
import { v4 as uuidv4 } from "uuid";


export class EnquiryModel extends BaseModel<Enquiry> {
  constructor() {
    super('enquiries', enquirySchema);
  }

  /** Create enquiry safely using authenticated user ID */
 async createEnquiry(
  data: Omit<Enquiry, 'id' | 'createdAt' | 'userId'>,
  userId: string
): Promise<Enquiry> {
  const eng_id: string = String(uuidv4());
  const createdAt = new Date();

  const validated = enquirySchema.parse({
    id: eng_id,
    userId,
    projectId: data.projectId ?? null,
    createdAt,
  });


  await db.query(
    'INSERT INTO enquiries (id, user_id, project_id, created_at) VALUES (?, ?, ?, ?)',
    [validated.id, validated.userId, validated.projectId, validated.createdAt]
  );


  return validated;
}


  /** Get all enquiries for a specific user */
  async getByUserId(userId: string): Promise<Enquiry[]> {
    const [rows]: any = await db.query(
      'SELECT * FROM enquiries WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows as Enquiry[];
  }

  /** Get all enquiries for a specific project */
  async getByProjectId(projectId: string): Promise<Enquiry[]> {
    const [rows]: any = await db.query(
      'SELECT * FROM enquiries WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );
    return rows as Enquiry[];
  }

  /** Get all enquiries made by a user */
  async getUserEnquiries(userId: string): Promise<Enquiry[]> {
  const [rows]: any = await db.query(
    'SELECT * FROM enquiries WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows as Enquiry[];
}

  /** PATCH: Update an enquiry (only by owner) */
  async updateEnquiry(
    id: string,
    userId: string,
    updates: Partial<Omit<Enquiry, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Enquiry | null> {
    // Check if enquiry belongs to user
    const [existing]: any = await db.query(
      'SELECT * FROM enquiries WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (!existing.length) return null;

    const fields = Object.keys(updates);
    if (!fields.length) return existing[0] as Enquiry;

    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map((field) => (updates as any)[field]);
    values.push(id, userId);

    await db.query(
      `UPDATE enquiries SET ${setClause} WHERE id = ? AND user_id = ?`,
      values
    );

    const [updated]: any = await db.query(
      'SELECT * FROM enquiries WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    return updated[0] as Enquiry;
  }

  /**  DELETE: Remove enquiry (only by owner) */
  async deleteEnquiry(id: string, userId: string): Promise<boolean> {
    const [result]: any = await db.query(
      'DELETE FROM enquiries WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
}

export const EnquiriesModel = new EnquiryModel();
