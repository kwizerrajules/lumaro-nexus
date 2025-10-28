import { z } from 'zod';
import {createStaffSchema, updateStaffSchema, staffOutputSchema} from '../../schemas/staff.schema'
import bcrypt from 'bcryptjs';
import db from "../db";


export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type StaffOutput = z.infer<typeof staffOutputSchema>;


export const StaffModel = {
    async createStaff(data: CreateStaffInput): Promise<StaffOutput> {
        const { id,names, email, phone, password, role, permissions, avatarUrl, status } = data;
        const passwordHash = await bcrypt.hash(password, 10);
        const [result]: any = await db.query(
            `INSERT INTO staff (id, names, email, phone, passwordHash, role, permissions, avatarUrl, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, names, email, phone || null, passwordHash, role, JSON.stringify(permissions || []), avatarUrl || null, status || 'ACTIVE']
            );
        const insertedId = result.insertId ?? result.id;
        const staff: StaffOutput = {
            id: insertedId,
            names,
            email,
            role,
            phone: phone || undefined,
            permissions: permissions || [],
            avatarUrl: avatarUrl || undefined,
            status: status || 'ACTIVE',
        };
        return staff;
    },
};  
