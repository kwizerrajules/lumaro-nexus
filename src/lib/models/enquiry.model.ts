import { BaseModel } from '../../../src/lib/models/base.model';
import { enquirySchema, Enquiry } from '../../../src/schemas/enquiry.schema';
import db from '../db';
import { v4 as uuidv4 } from "uuid";


interface UserData {
  id: string;
  names: string;
  email: string;
  phone?: string;
}

interface ProjectData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  additionalImages?: string[];
  status: "planned" | "in-progress" | "completed" | "on-hold";
  rooms?: number;
  height?: number;
  width?: number;
  areaSqFt?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  category?: string;
  style?: string;
  type?: string;
  price?: number;
  views: number;
  likes: number;
  createdAt?: string;
  updatedAt?: string;
}

interface EnquiryWithDetails {
  id: string;
  created_at: string;
  user_data: UserData;
  project_data: ProjectData;
}



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
 async getByUserId(userId: string): Promise<any[]> {
  const [rows]: any = await db.query(
    `SELECT 
        e.id AS enquiry_id,
        e.user_id,
        e.project_id,
        e.created_at AS enquiry_created_at,
        
        p.id AS project_id,
        p.title AS project_title,
        p.price AS project_price,
        p.bedrooms,
        p.bathrooms,
        p.floors,
        p.area,
        p.description

     FROM enquiries e
     LEFT JOIN house_projects p 
       ON e.project_id = p.id
     WHERE e.user_id = ?
     ORDER BY e.created_at DESC`,
    [userId]
  );

  return rows;
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
async getUserEnquiries(userId: string): Promise<any[]> {
  const [rows]: any = await db.query(
    `SELECT 
        e.id AS enquiry_id,
        e.user_id,
        e.project_id,
        e.created_at AS enquiry_created_at,

        p.id AS project_id,
        p.title AS project_title,
        p.price AS project_price,
        p.bedrooms,
        p.bathrooms,
        p.floors,
        p.areaSqFt,
        p.description,
        p.thumbnail

     FROM enquiries e
     LEFT JOIN house_projects p
       ON e.project_id = p.id
     WHERE e.user_id = ?
     ORDER BY e.created_at DESC`,
    [userId]
  );

  return rows;
}




async  getAllEnquiries(limit = 20, offset = 0): Promise<EnquiryWithDetails[]> {
  const [rows]: any = await db.query(`
    SELECT 
      e.id AS enquiry_id,
      e.created_at,

      u.id AS user_id,
      u.names AS user_names,
      u.email AS user_email,
      u.phone AS user_phone,

      p.id AS project_id,
      p.title AS project_title,
      p.thumbnail AS project_thumbnail,
      p.status AS project_status,
      p.price AS project_price

    FROM enquiries e
    JOIN users u ON e.user_id = u.id
    JOIN house_projects p ON e.project_id = p.id
    ORDER BY e.created_at DESC
    LIMIT ? OFFSET ?
  `, [limit, offset]);

  return rows.map((row: any) => ({
    id: row.enquiry_id,
    created_at: row.created_at,
    user_data: {
      id: row.user_id,
      names: row.user_names,
      email: row.user_email,
      phone: row.user_phone
    },
    project_data: {
      id: row.project_id,
      title: row.project_title,
      thumbnail: row.project_thumbnail,
      status: row.project_status,
      price: row.project_price
    }
  }));
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
