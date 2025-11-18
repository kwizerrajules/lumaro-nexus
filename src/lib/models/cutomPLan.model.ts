import db from "../db";
import { uuid as uuidv4 } from "zod";

export interface CustomPlan {
  id?: string;
  user_id: string;
  bedrooms: number;
  bathrooms: number;
  dining_rooms: number;
  kitchen: number;
  floors: number;
  total_area: number;
  category: string;
  description: string;
  created_at?: Date;
  updated_at?: Date;
}

export const CustomPlanModel = {
  async create(plan: CustomPlan) {
    const [result] = await db.execute(
      `INSERT INTO custom_plans 
        (id, user_id, bedrooms, bathrooms, dining_rooms, kitchen, floors, total_area, category, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        crypto.randomUUID(),
        plan.user_id,
        plan.bedrooms,
        plan.bathrooms,
        plan.dining_rooms,
        plan.kitchen,
        plan.floors,
        plan.total_area,
        plan.category,
        plan.description,
      ]
    );
    return result;
  },

  async getAllByUser(user_id: string) {
    const [rows] = await db.execute(
      `SELECT * FROM custom_plans WHERE user_id = ? ORDER BY created_at DESC`,
      [user_id]
    );
    return rows;
  },

  async getAllCustomPLans() {
    const sql = `
      SELECT 
        cp.*, 
        u.email, 
        u.names 
      FROM 
        custom_plans cp
      LEFT JOIN 
        users u 
      ON 
        cp.user_id = u.id
    `;
    
    const [rows] = await db.execute(sql);
    return rows;
  },

  async getById(id: string) {
    const [rows] = await db.execute(
      `SELECT * FROM custom_plans WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  async update(id: string, updates: Partial<CustomPlan>) {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);
    values.push(id);
    const [result] = await db.execute(
      `UPDATE custom_plans SET ${fields}, updated_at = NOW() WHERE id = ?`,
      values
    );
    return result;
  },

  async delete(id: string) {
    const [result] = await db.execute(`DELETE FROM custom_plans WHERE id = ?`, [id]);
    return result;
  },
};
