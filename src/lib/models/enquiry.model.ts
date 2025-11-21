import { BaseModel } from '../../../src/lib/models/base.model';
import { enquirySchema, Enquiry } from '../../../src/schemas/enquiry.schema';
import { v4 as uuidv4 } from "uuid";
import getClientPromise from '../mongodb';
import { Collection } from "mongodb";

const COLLECTION_NAME = "enquiries";
const USERS_COLLECTION_NAME = "users";
const PROJECTS_COLLECTION_NAME = "house_projects";
const DB_NAME = "LUMARO";

// Helper function to get the collection instance
async function getEnquiryCollection(): Promise<Collection<Enquiry & { _id: string }>> {
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    return db.collection<Enquiry & { _id: string }>(COLLECTION_NAME);
}

interface UserData {
  id: string; names: string; email: string; phone?: string;
}
interface ProjectData {
  id: string; title: string; description: string; thumbnail: string;
  additionalImages?: string[]; status: string; rooms?: number; height?: number;
  width?: number; areaSqFt?: number; location?: string; bedrooms?: number;
  bathrooms?: number; floors?: number; category?: string; style?: string;
  type?: string; price?: number; views: number; likes: number; createdAt?: string;
  updatedAt?: string;
}
interface EnquiryWithDetails {
  id: string;
  createdAt: Date;
  user_data: Partial<UserData>;
  project_data: Partial<ProjectData>;
}


export class EnquiryModel extends BaseModel<Enquiry> {
  constructor() {
    super(COLLECTION_NAME, enquirySchema);
  }

  /** Create enquiry safely using authenticated user ID */
  async createEnquiry(
    data: Omit<Enquiry, 'id' | 'createdAt' | 'userId'>,
    userId: string
  ): Promise<Enquiry> {
    const _id: string = String(uuidv4());
    const createdAt = new Date();

    const validated = enquirySchema.parse({
      id: _id, // Zod uses 'id' but we map it to '_id'
      userId,
      projectId: data.projectId ?? null,
      createdAt: createdAt.toISOString(), // Zod expects string date
    });

    const newDocument = {
        _id,
        userId: validated.userId,
        projectId: validated.projectId,
        createdAt, // Store as native Date object
    };
    
    const collection = await getEnquiryCollection();
    await collection.insertOne(newDocument as any);

    return validated;
  }

  private getDetailsPipeline(query: any = {}) {
    return [
      // 1. Initial Filter
      { $match: query },
      
      {
        $lookup: {
          from: USERS_COLLECTION_NAME,
          localField: 'userId',
          foreignField: '_id',
          as: 'user_data_array', // Temp array field
        },
      },
      { $unwind: { path: '$user_data_array', preserveNullAndEmptyArrays: true } },
      
      {
        $lookup: {
          from: PROJECTS_COLLECTION_NAME,
          localField: 'projectId',
          foreignField: '_id',
          as: 'project_data_array', // Temp array field
        },
      },
      { $unwind: { path: '$project_data_array', preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 0, // Exclude Mongo's _id for clean output
          id: '$_id', // Map back to 'id'
          createdAt: '$createdAt',

          user_data: {
            id: '$user_data_array._id',
            names: '$user_data_array.names', // Assuming 'names' is the user field
            email: '$user_data_array.email',
            phone: '$user_data_array.phone',
          },
          
          project_data: {
            id: '$project_data_array._id',
            title: '$project_data_array.title',
            thumbnail: '$project_data_array.thumbnail',
            status: '$project_data_array.status',
            price: '$project_data_array.price',
            description: '$project_data_array.description',
            areaSqFt: '$project_data_array.areaSqFt',
            bedrooms: '$project_data_array.bedrooms',
            bathrooms: '$project_data_array.bathrooms',
            floors: '$project_data_array.floors',
          },
        },
      },
      // 5. Sorting
      { $sort: { createdAt: -1 } },
    ];
  }

  async getUserEnquiries(userId: string): Promise<EnquiryWithDetails[]> {
    const collection = await getEnquiryCollection();
    const query = { userId: userId };
    
    const pipeline = this.getDetailsPipeline(query);

    const results = await collection.aggregate(pipeline).toArray();

    return results.map(doc => ({
      id: doc.id,
      createdAt: doc.createdAt,
      user_data: doc.user_data,
      project_data: doc.project_data,
    })) as EnquiryWithDetails[];
  }

  async getByProjectId(projectId: string): Promise<Enquiry[]> {
    const collection = await getEnquiryCollection();
    const documents = await collection.find({ projectId: projectId })
      .sort({ createdAt: -1 })
      .toArray();

    // Map _id back to 'id'
    return documents.map(doc => {
        const { _id, ...rest } = doc;
        return { id: _id, ...rest } as Enquiry;
    });
  }

  async getAllEnquiries(limit = 20, offset = 0): Promise<EnquiryWithDetails[]> {
    const collection = await getEnquiryCollection();
    
    const pipeline = [
      ...this.getDetailsPipeline(), // Use the core pipeline for JOINs and shape
      // 6. Pagination
      { $skip: offset },
      { $limit: limit },
    ];
    
    const results = await collection.aggregate(pipeline).toArray();

    return results.map(doc => ({
      id: doc.id,
      createdAt: doc.createdAt,
      user_data: doc.user_data,
      project_data: doc.project_data,
    })) as EnquiryWithDetails[];
  }

async updateEnquiry(
    id: string,
    userId: string,
    updates: Partial<Omit<Enquiry, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Enquiry | null> {
    const collection = await getEnquiryCollection();
    
    const rawResult = await collection.findOneAndUpdate(
      { _id: id, userId: userId }, // Query: check ID and owner ID
      { $set: updates },           // Updates
      { returnDocument: 'after' }  // Get the updated document back
    );

    // Normalize to the updated document (or null)
    const updatedDocument = (rawResult as any)?.value ?? (rawResult as any) ?? null;

    if (!updatedDocument) return null;

    const typedDoc = updatedDocument as Enquiry & { _id: string };

    // Map _id back to 'id'
    const { _id, ...rest } = typedDoc;
    
    // Note: We cast to Enquiry here, assuming the update conforms to the schema
    return { id: _id, ...rest } as Enquiry; 
  }
}