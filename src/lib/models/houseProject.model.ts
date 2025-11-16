import pool from "../db";
import { HouseProject, HouseProjectSchema } from "../../../src/schemas/house.projects.schema";
import { v4 as uuidv4 } from "uuid";

export const HouseProjectModel = {
  // CREATE
  async create(data: HouseProject): Promise<HouseProject> {
    const parsed = HouseProjectSchema.parse(data);
    const id = parsed.id || uuidv4();
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    // checking if the type is already in the database

    // const checkType =  await pool.query("SELECT category from house_projects WHERE categort = ?", [parsed.type]);
    // if (checkType.length > 0) {
    //   throw new Error("The type")
    // }

    const query = `
      INSERT INTO house_projects (
        id, title, description, thumbnail, additionalImages, status, rooms, height, width,
        areaSqFt, location, bedrooms, bathrooms, floors, category, style,type,
        price, views, likes, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(query, [
      parsed.id,
      parsed.title,
      parsed.description,
      parsed.thumbnail,
      JSON.stringify(parsed.additionalImages || []),
      parsed.status,
      parsed.rooms || 0,
      parsed.height || null,
      parsed.width || null,
      parsed.areaSqFt || null,
      parsed.location || null,
      parsed.bedrooms || 0,
      parsed.bathrooms || 0,
      parsed.floors || 0,
      parsed.category || null,
      parsed.style || null,
      parsed.type || null,
      parsed.price || 0,
      parsed.views,
      parsed.likes,
      now,
      now,
    ]);
    return { ...parsed, id, createdAt: now, updatedAt: now };
  },

  // READ (Single)
  async getById(id: string): Promise<HouseProject | null> {
  const [rows]: any = await pool.query("SELECT * FROM house_projects WHERE id = ?", [id]);
  if (!rows.length) return null;

  const project = rows[0];

  if (typeof project.additionalImages === "string") {
    try {
      project.additionalImages = JSON.parse(project.additionalImages);
    } catch {
      project.additionalImages = [];
    }
  }

  return project;
},

  // READ (List with Filtering + Pagination + Search)
  async getAll(options?: {
    limit?: number;
    offset?: number;
    status?: string;
    category?: string;
    style?: string;
    search?: string;
  }): Promise<{ data: HouseProject[]; total: number }> {
    const { limit = 10, offset = 0, status, category, style, search } = options || {};

    const conditions: string[] = [];
    const params: any[] = [];

    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }
    if (style) {
      conditions.push("style = ?");
      params.push(style);
    }
    if (search) {
      conditions.push("MATCH(title, description) AGAINST(? IN NATURAL LANGUAGE MODE)");
      params.push(search);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // Get total count
    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total FROM house_projects ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    // Get paginated data
    const [rows]: any = await pool.query(
      `SELECT * FROM house_projects ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { data: rows, total };
  },

  // UPDATE
  async update(id: string, data: Partial<HouseProject>): Promise<void> {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  const [existing]: any = await pool.query("SELECT * FROM house_projects WHERE id = ?", [id]);
  if (!existing.length) throw new Error("Project not found");

  // Merge old data with new
  const updated = { ...existing[0], ...data, updatedAt: now };

  // Ensure ID is not updated
  delete (updated as any).id;

  // Handle additionalImages properly
  if ("additionalImages" in updated && Array.isArray(updated.additionalImages)) {
    updated.additionalImages = JSON.stringify(updated.additionalImages);
  }

  // Remove keys that do not exist in DB table
  const allowedColumns = [
    "title", "description", "thumbnail", "additionalImages", "status",
    "rooms", "height", "width", "areaSqFt", "location", "bedrooms",
    "bathrooms", "floors", "category", "style", "type", "price",
    "views", "likes", "createdAt", "updatedAt"
  ];

  const finalUpdate: any = {};
  for (const key of allowedColumns) {
    if (updated[key] !== undefined) {
      finalUpdate[key] = updated[key];
    }
  }

  await pool.query("UPDATE house_projects SET ? WHERE id = ?", [finalUpdate, id]);
},

  // DELETE
  async delete(id: string): Promise<void> {
    await pool.query("DELETE FROM house_projects WHERE id = ?", [id]);
  },
};
