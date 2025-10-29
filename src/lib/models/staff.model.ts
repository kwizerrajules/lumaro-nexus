import { z } from 'zod';
import {createStaffSchema, updateStaffSchema, staffOutputSchema} from '../../schemas/staff.schema'
import bcrypt from 'bcryptjs';
import db from "../db";
import { NextResponse } from 'next/server';
import { tr } from 'zod/locales';

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type StaffOutput = z.infer<typeof staffOutputSchema>;


export const StaffModel = {
    async createStaff(data: CreateStaffInput): Promise<StaffOutput> {
        const { id,names, email, phone, password, role, permissions, avatarUrl, status } = data;
        const passwordHash = await bcrypt.hash(password, 10);

        // first check if email already exists
        try {
        const [existing]: any = await db.query(
            `SELECT id FROM staff WHERE email = ?`,
            [email]
        );
        if (existing.length > 0) {
            throw new Error('Email already in use');
        }
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
    } catch (error) {
        throw error;
    }
    },
    async getStaffByEmail(email: string): Promise<(StaffOutput & { passwordHash: string }) | null> {
        const [rows]: any = await db.query(
            `SELECT * FROM staff WHERE email = ?`,
            [email]
        );
        if (rows.length === 0) {
            return null;
        }
        const staff = rows[0];
        return {
            id: staff.id,
            names: staff.names,
            email: staff.email,
            phone: staff.phone || undefined,
            role: staff.role,
            permissions: JSON.parse(staff.permissions || '[]'),
            avatarUrl: staff.avatarUrl || undefined,
            status: staff.status,
            passwordHash: staff.passwordHash,
        };
    }
};  
