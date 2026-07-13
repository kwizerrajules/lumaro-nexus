import { CreateUserInput, LoginUserInput, UpdateUserInput } from '../../../src/schemas/users.schema';
import getClientPromise from "../mongodb";
import { Collection } from 'mongodb';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

type UserDocument = Omit<CreateUserInput, 'password'> & {
  _id: string;
  password?: string;
  authProvider?: string;
  avatarUrl?: string;
};
type UserOutput = Omit<UserDocument, '_id' | 'password'> & { id: string };


const COLLECTION_NAME = "users";
const DB_NAME = "LUMARO"; // <-- Update this

async function getUsersCollection(): Promise<Collection<UserDocument>> {
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    return db.collection<UserDocument>(COLLECTION_NAME);
}

export const UsersModel = {
  async createUser(userData: CreateUserInput): Promise<UserOutput> {
    const { names, email, phone, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const _id = uuidv4();
    const collection = await getUsersCollection();

    const existing = await collection.findOne({ email });
    if (existing) {
      throw new Error('Email already in use');
    }

    if (phone) {
      const existingPhone = await collection.findOne({ phone });
      if (existingPhone) {
        throw new Error('Phone number already in use');
      }
    }

    const newUserDocument: UserDocument = {
        _id: _id,
        names,
        email,
        phone,
        password: hashedPassword, // Stored as 'password' hash in MongoDB
    };

    try {
      await collection.insertOne(newUserDocument as any);
    } catch (error: any) {
      if (error.code === 11000) { 
        if (error.keyPattern?.email) {
            throw new Error('Email already in use');
        }
        if (error.keyPattern?.phone) {
            throw new Error('Phone number already in use');
        }
        throw new Error('Account already exists');
      }
      throw error;
    }

    // Return the public-facing output (without password hash) and map _id to id
    const { _id: insertedId, password: _, ...rest } = newUserDocument;
    return { id: insertedId, ...rest };
  },

  async createGoogleUser(data: { names: string; email: string; avatarUrl?: string; phone?: string }): Promise<UserOutput> {
    const { names, email, avatarUrl, phone } = data;
    const collection = await getUsersCollection();

    const newUserDocument: UserDocument = {
      _id: uuidv4(),
      names,
      email,
      phone,
      avatarUrl,
      authProvider: 'google',
    };

    try {
      await collection.insertOne(newUserDocument as any);
    } catch (error: any) {
      // If the email already exists (race / already registered), return the existing user.
      if (error.code === 11000) {
        const existing = await collection.findOne({ email });
        if (existing) {
          const { _id, password: _pw, ...rest } = existing;
          return { id: _id, ...rest };
        }
      }
      throw error;
    }

    const { _id: insertedId, password: _pw, ...rest } = newUserDocument;
    return { id: insertedId, ...rest };
  },

  async getUserByEmail(email: string): Promise<(UserOutput & { password?: string }) | null> {
    const collection = await getUsersCollection();
    
    // Find one document matching the email
    const userDocument = await collection.findOne(
      { email: email },
    );

    if (!userDocument) {
      return null;
    }

    // Map _id to id and return hash for login verification
    const { _id, ...rest } = userDocument;
    return { id: _id, ...rest };
  },

  async getUserById(id: string): Promise<UserOutput | null> {
    const collection = await getUsersCollection();
    
    // Find one document by _id
    const userDocument = await collection.findOne(
      { _id: id },
      { projection: { password: 0 } } // Exclude the sensitive password hash
    );

    if (!userDocument) {
      return null;
    }

    // Map _id to id
    const { _id, password: _, ...rest } = userDocument;
    return { id: _id, ...rest };
  },
  
  async getAllUsers(): Promise<UserOutput[]> {
    const collection = await getUsersCollection();
    
    const users = await collection.find(
      {},
      { projection: { password: 0 } } 
    ).toArray();

    // Map _id to id for all users
    return users.map(user => {
        const { _id, password: _, ...rest } = user;
        return { id: _id, ...rest };
    });
  },
  
  async updateUser(id: string, updateData: UpdateUserInput): Promise<UserOutput | null> {
    const collection = await getUsersCollection();
    const updateQuery: any = {};
    const $set: any = {};
    
    // 1. Process password update if present
    if (updateData.password) {
      $set.password = await bcrypt.hash(updateData.password, 10);
      delete updateData.password; 
    }

    Object.assign($set, updateData);
    
    // Add updatedAt timestamp (if you want to track updates)
    $set.updatedAt = new Date(); 

    updateQuery.$set = $set;

    const result = await collection.findOneAndUpdate(
      { _id: id },
      updateQuery,
      { returnDocument: 'after', projection: { password: 0 } } // Return updated doc, exclude password
    );

    if (!result) return null;

    const { _id, password: _, ...rest } = result;
    return { id: _id, ...rest };
  },

  async deleteUser(id: string): Promise<{ success: boolean }> {
    const collection = await getUsersCollection();
    
    const result = await collection.deleteOne({ _id: id });
    
    return { success: result.deletedCount > 0 };
  },
};