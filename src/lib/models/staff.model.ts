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
    },

    async getStaffById(id: string): Promise<StaffWithHash | null> {
        const collection = await getStaffCollection();
        let staffDocument: any = await collection.findOne({ _id: id as any });
        if (!staffDocument && ObjectId.isValid(id)) {
            staffDocument = await collection.findOne({ _id: new ObjectId(id) as any });
        }
        if (!staffDocument) {
            return null;
        }

        return {
            id: String(staffDocument._id),
            names: staffDocument.names,
            email: staffDocument.email,
            phone: staffDocument.phone,
            role: staffDocument.role,
            permissions: staffDocument.permissions || [],
            avatarUrl: staffDocument.avatarUrl,
            status: staffDocument.status,
            passwordHash: staffDocument.passwordHash,
        };
    },

    async getStaffByIdOrEmail(id?: string, email?: string): Promise<StaffWithHash | null> {
        if (id) {
            const byId = await this.getStaffById(id);
            if (byId) return byId;
        }
        if (email) {
            return await this.getStaffByEmail(email);
        }
        return null;
    },

    async updateStaffProfile(
        id: string,
        emailFallback: string | undefined,
        data: { names?: string; email?: string; phone?: string; avatarUrl?: string }
    ): Promise<StaffOutput> {
        const collection = await getStaffCollection();
        let query: any = { _id: id };
        let existing: any = await collection.findOne(query);
        if (!existing && ObjectId.isValid(id)) {
            query = { _id: new ObjectId(id) };
            existing = await collection.findOne(query);
        }
        if (!existing && emailFallback) {
            query = { email: emailFallback };
            existing = await collection.findOne(query);
        }
        if (!existing) {
            throw new Error("Staff member not found");
        }

        if (data.email && data.email.toLowerCase() !== existing.email.toLowerCase()) {
            const conflict = await collection.findOne({
                email: data.email.trim().toLowerCase(),
                _id: { $ne: existing._id }
            });
            if (conflict) {
                throw new Error("Email is already taken by another account");
            }
        }

        const updateFields: any = {};
        if (data.names !== undefined) updateFields.names = data.names.trim();
        if (data.email !== undefined) updateFields.email = data.email.trim().toLowerCase();
        if (data.phone !== undefined) updateFields.phone = data.phone.trim();
        if (data.avatarUrl !== undefined) updateFields.avatarUrl = data.avatarUrl.trim();

        await collection.updateOne({ _id: existing._id }, { $set: updateFields });

        const updated: any = await collection.findOne({ _id: existing._id });
        return {
            id: String(updated._id),
            names: updated.names,
            email: updated.email,
            phone: updated.phone,
            role: updated.role,
            permissions: updated.permissions || [],
            avatarUrl: updated.avatarUrl,
            status: updated.status,
        };
    },

    async updateStaffPassword(
        id: string,
        emailFallback: string | undefined,
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        const collection = await getStaffCollection();
        let query: any = { _id: id };
        let existing: any = await collection.findOne(query);
        if (!existing && ObjectId.isValid(id)) {
            query = { _id: new ObjectId(id) };
            existing = await collection.findOne(query);
        }
        if (!existing && emailFallback) {
            query = { email: emailFallback };
            existing = await collection.findOne(query);
        }
        if (!existing) {
            throw new Error("Staff member not found");
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, existing.passwordHash);
        if (!isPasswordValid) {
            throw new Error("Current password is incorrect");
        }

        if (!newPassword || newPassword.length < 8) {
            throw new Error("New password must be at least 8 characters long");
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await collection.updateOne({ _id: existing._id }, { $set: { passwordHash: newPasswordHash } });
    }
};