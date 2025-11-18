import { CreateUserInput, LoginUserInput, UpdateUserInput } from '../../../src/schemas/users.schema';
import db from '../db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const UsersModel = {
  async createUser(userData: CreateUserInput) {
    const { names, email, phone, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    // first check if email already exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    //check if phone already exists
    if (phone) {
      const [rows]: any = await db.query(
        'SELECT id FROM users WHERE phone = ?',
        [phone]
      );
      if (rows.length > 0) {
        throw new Error('Phone number already in use');
      }
    }

    await db.query(
      'INSERT INTO users (id, names, email, phone, password) VALUES (?, ?, ?, ?, ?)',
      [id, names, email, phone, hashedPassword]
    );

    return { id, names, email, phone };
  },

  async getUserByEmail(email: string) {
    const [rows]: any = await db.query(
      'SELECT id, names, email, phone, password FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  async getUserById(id: string) {
    const [rows]: any = await db.query(
      'SELECT id, names, email, phone FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },
  async getAllUsers() {
    const [rows]: any = await db.query('SELECT id, names, email, phone FROM users');
    return rows;
  },
  
  async updateUser(id: string, updateData: UpdateUserInput) {
    const fields: string[] = [];
    const values: any[] = [];

    for (const key in updateData) {
      if (key === 'password') {
        const hashed = await bcrypt.hash((updateData as any)[key], 10);
        fields.push('password = ?');
        values.push(hashed);
      } else {
        fields.push(`${key} = ?`);
        values.push((updateData as any)[key]);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);

    await db.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    const [rows]: any = await db.query(
      'SELECT id, names, email, phone FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async deleteUser(id: string) {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    return { success: true };
  },
};
