import { z } from 'zod';
import {createStaffSchema, updateStaffSchema, staffOutputSchema} from '../../schemas/staff.schema'
import bcrypt from 'bcryptjs';
import getClientPromise from "../mongodb";
import { Collection, ObjectId } from 'mongodb';

// --- Type Definitions (Assuming these are correct) ---
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type StaffOutput = z.infer<typeof staffOutputSchema>;

type StaffWithHash = StaffOutput & { passwordHash: string };

const COLLECTION_NAME = "staff";
const DB_NAME = "LUMARO";

async function getStaffCollection(): Promise<Collection<StaffWithHash & { _id: string }>> {
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    return db.collection<StaffWithHash & { _id: string }>(COLLECTION_NAME);
}

export const StaffModel = {
    async createStaff(data: CreateStaffInput): Promise<StaffOutput> {
        const { id, names, email, phone, password, role, permissions, avatarUrl, status } = data;
        const passwordHash = await bcrypt.hash(password, 10);
        const collection = await getStaffCollection();

        const existingStaff = await collection.findOne(
            { email: email },
            { projection: { _id: 1 } } // Only fetch _id for existence check
        );

        if (existingStaff) {
            throw new Error('Email already in use');
        }
        
        const newStaff: StaffWithHash & { _id: string } = {
            _id: id, // Use the provided ID as the primary key
            names,
            email,
            phone: phone || undefined,
            passwordHash,
            role,
            permissions: permissions || [], // Stored as a native array
            avatarUrl: avatarUrl || undefined,
            status: status || 'ACTIVE',
        };

        // 3. Insert the document
        await collection.insertOne(newStaff as any);

        // 4. Return the public-facing output (without passwordHash)
        const staffOutput: StaffOutput = {
            id: newStaff._id,
            names: newStaff.names,
            email: newStaff.email,
            role: newStaff.role,
            phone: newStaff.phone,
            permissions: newStaff.permissions,
            avatarUrl: newStaff.avatarUrl,
            status: newStaff.status,
        };
        return staffOutput;
    },

    async getStaffByEmail(email: string): Promise<StaffWithHash | null> {
        const collection = await getStaffCollection();

        // MongoDB findOne operation
        const staffDocument = await collection.findOne({ email: email });

        if (!staffDocument) {
            return null;
        }

        return {
            id: staffDocument._id, // Map _id back to id
            names: staffDocument.names,
            email: staffDocument.email,
            phone: staffDocument.phone,
            role: staffDocument.role,
            permissions: staffDocument.permissions,
            avatarUrl: staffDocument.avatarUrl,
            status: staffDocument.status,
            passwordHash: staffDocument.passwordHash,
        };
    }
};