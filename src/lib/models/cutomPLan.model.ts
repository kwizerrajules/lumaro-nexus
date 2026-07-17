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

/** Shape returned to the user dashboard / API clients */
export type PublicCustomPlan = {
  id: string;
  user_id: string;
  bedrooms: number;
  bathrooms: number;
  dining_rooms: number;
  kitchen: number;
  floors: number;
  total_area: number;
  category: string;
  description: string;
  created_at: string;
  updated_at: string;
};

function toPublicPlan(doc: CustomPlanDocument): PublicCustomPlan {
  return {
    id: doc._id,
    user_id: doc.userId,
    bedrooms: doc.bedrooms,
    bathrooms: doc.bathrooms,
    dining_rooms: doc.dining_rooms,
    kitchen: doc.kitchen,
    floors: doc.floors,
    total_area: doc.total_area,
    category: doc.category,
    description: doc.description,
    created_at: doc.createdAt?.toISOString?.() ?? String(doc.createdAt),
    updated_at: doc.updatedAt?.toISOString?.() ?? String(doc.updatedAt),
  };
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
  async create(plan: CustomPlan): Promise<PublicCustomPlan> {
    const collection = await getCustomPlansCollection();
    const now = new Date();
    const newId = crypto.randomUUID();

    const newDocument: CustomPlanDocument = {
        _id: newId,
        userId: plan.user_id,
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
    
    return toPublicPlan(newDocument);
  },

  async getAllByUser(user_id: string): Promise<PublicCustomPlan[]> {
    const collection = await getCustomPlansCollection();
    
    const documents = await collection
      .find({ userId: user_id })
      .sort({ createdAt: -1 })
      .toArray();

    return documents.map(toPublicPlan);
  },

  async getAllCustomPLans(): Promise<CustomPlanWithUser[]> {
    const collection = await getCustomPlansCollection();
    
    const pipeline = planUserLookupPipeline();
    
    const rows = await collection.aggregate(pipeline).toArray();

    return rows as CustomPlanWithUser[];
  },

  async getById(id: string): Promise<PublicCustomPlan | null> {
    const collection = await getCustomPlansCollection();
    
    const document = await collection.findOne({ _id: id });
    
    if (!document) return null;
    
    return toPublicPlan(document);
  },

  async update(id: string, updates: Partial<CustomPlan>): Promise<PublicCustomPlan | null> {
    const collection = await getCustomPlansCollection();
    const now = new Date();
    const $set: any = { updatedAt: now };

    for (const key in updates) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
            let fieldName = key;
            if (key === 'user_id') {
                fieldName = 'userId';
            } else if (key === 'created_at') {
                fieldName = 'createdAt';
            } else if (key === 'id') {
                continue;
            }
            $set[fieldName] = (updates as any)[key];
        }
    }

    const result = await collection.findOneAndUpdate(
      { _id: id },
      { $set },
      { returnDocument: 'after' }
    );
    
    return result ? toPublicPlan(result) : null;
  },

  async delete(id: string): Promise<boolean> {
    const collection = await getCustomPlansCollection();
    
    const result = await collection.deleteOne({ _id: id });
    
    return result.deletedCount > 0;
  },
};