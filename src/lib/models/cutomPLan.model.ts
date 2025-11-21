import getClientPromise from "../mongodb";
import { Collection } from "mongodb";

// Assuming this interface exists
export interface CustomPlan {
  id?: string;
  user_id: string; // Will be mapped to 'userId' in MongoDB
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

interface CustomPlanDocument {
    _id: string;
    userId: string;
    bedrooms: number;
    bathrooms: number;
    dining_rooms: number;
    kitchen: number;
    floors: number;
    total_area: number;
    category: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

interface CustomPlanWithUser extends Omit<CustomPlan, 'user_id' | 'created_at' | 'updated_at'> {
    id: string;
    userId: string;
    email: string;
    names: string;
    createdAt: Date;
    updatedAt: Date;
}

const COLLECTION_NAME = "custom_plans";
const USERS_COLLECTION_NAME = "users";
const DB_NAME = "LUMARO";

async function getCustomPlansCollection(): Promise<Collection<CustomPlanDocument>> {
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    return db.collection<CustomPlanDocument>(COLLECTION_NAME);
}

// Helper to create the projection/lookup pipeline for fetching all plans with user data
const planUserLookupPipeline = () => [
    // 1. LEFT JOIN equivalent using $lookup
    {
        $lookup: {
            from: USERS_COLLECTION_NAME,
            localField: 'userId', // Field in custom_plans
            foreignField: '_id',  // Field in users
            as: 'user_info'
        }
    },
    {
        $unwind: {
            path: '$user_info',
            preserveNullAndEmptyArrays: true // Keep plans even if user_id reference is broken (LEFT JOIN)
        }
    },
    {
        $project: {
            _id: 0, // Exclude internal MongoDB _id from the final output
            id: '$_id',
            user_id: '$userId', // Keep user_id if needed, or map it to userId
            bedrooms: 1, bathrooms: 1, dining_rooms: 1, kitchen: 1, floors: 1,
            total_area: 1, category: 1, description: 1,
            created_at: '$createdAt', // Map BSON Date to interface field name
            updated_at: '$updatedAt', // Map BSON Date to interface field name

            // Include user details from the joined document
            email: '$user_info.email',
            names: '$user_info.names',
        }
    },
    { $sort: { createdAt: -1 } } // Sort by creation date descending
];


export const CustomPlanModel = {
  async create(plan: CustomPlan): Promise<CustomPlanDocument> {
    const collection = await getCustomPlansCollection();
    const now = new Date();
    const newId = crypto.randomUUID(); // Use native crypto.randomUUID()

    // Map plan input (user_id, created_at) to MongoDB conventions (userId, createdAt)
    const newDocument: CustomPlanDocument = {
        _id: newId,
        userId: plan.user_id, // Map from user_id to userId
        bedrooms: plan.bedrooms,
        bathrooms: plan.bathrooms,
        dining_rooms: plan.dining_rooms,
        kitchen: plan.kitchen,
        floors: plan.floors,
        total_area: plan.total_area,
        category: plan.category,
        description: plan.description,
        createdAt: now,
        updatedAt: now,
    };
    
    await collection.insertOne(newDocument as any);
    
    return newDocument;
  },

  async getAllByUser(user_id: string): Promise<CustomPlanDocument[]> {
    const collection = await getCustomPlansCollection();
    
    const documents = await collection
      .find({ userId: user_id }) // Query using userId
      .sort({ createdAt: -1 })
      .toArray();

    return documents;
  },

  async getAllCustomPLans(): Promise<CustomPlanWithUser[]> {
    const collection = await getCustomPlansCollection();
    
    // Use the Aggregation Pipeline to perform the JOIN
    const pipeline = planUserLookupPipeline();
    
    const rows = await collection.aggregate(pipeline).toArray();

    // The result from aggregation is already shaped by the $project stage
    return rows as CustomPlanWithUser[];
  },

  async getById(id: string): Promise<CustomPlanDocument | null> {
    const collection = await getCustomPlansCollection();
    
    const document = await collection.findOne({ _id: id });
    
    // Map _id back to 'id' if needed for external interface consistency
    if (!document) return null;
    
    return document;
  },

  async update(id: string, updates: Partial<CustomPlan>): Promise<CustomPlanDocument | null> {
    const collection = await getCustomPlansCollection();
    const now = new Date();
    const $set: any = { updatedAt: now };

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            let fieldName = key;
            if (key === 'user_id') {
                fieldName = 'userId';
            } else if (key === 'created_at') {
                fieldName = 'createdAt';
            }
            $set[fieldName] = (updates as any)[key];
        }
    }

    const result = await collection.findOneAndUpdate(
      { _id: id },
      { $set },
      { returnDocument: 'after' }
    );
    
    return result || null;
  },

  async delete(id: string): Promise<boolean> {
    const collection = await getCustomPlansCollection();
    
    const result = await collection.deleteOne({ _id: id });
    
    return result.deletedCount > 0;
  },
};