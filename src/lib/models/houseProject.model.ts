import { HouseProject, HouseProjectSchema } from "../../../src/schemas/house.projects.schema";
import { v4 as uuidv4 } from "uuid";
// Correctly importing your client promise function
import getClientPromise from "../mongodb"; 

const COLLECTION_NAME = "house_projects";
const DB_NAME = "LUMARO";

// Helper function to get the collection instance
async function getHouseProjectsCollection() {
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    return db.collection<HouseProject & { _id: string }>(COLLECTION_NAME);
}

export const HouseProjectModel = {
  // CREATE
  async create(data: HouseProject): Promise<HouseProject> {
    const parsed = HouseProjectSchema.parse(data);
    
    const _id = parsed.id || uuidv4(); 
    const now = new Date();
    

    const newDocument = {
      ...parsed,
      _id: _id, 
      createdAt: now,
      updatedAt: now,
    };
    delete (newDocument as any).id;

    const collection = await getHouseProjectsCollection();
    
    await collection.insertOne(newDocument as any); // Type assertion needed due to dynamic _id addition
    
    return { ...parsed, id: _id, createdAt: now.toISOString(), updatedAt: now.toISOString() };
  },

  // READ (Single)
  async getById(id: string): Promise<HouseProject | null> {
    const collection = await getHouseProjectsCollection();
    
    // findOne takes the query object, searching by _id
    const document = await collection.findOne({ _id: id });

    if (!document) return null;
    
    // Map _id back to 'id' for the TypeScript interface consistency
    const { _id, ...rest } = document;
    return { id: _id, ...rest } as HouseProject;
  },

  // READ (List with Filtering + Pagination + Search)
  async getAll(options?: {
    limit?: number;
    offset?: number;
    status?: string;
    category?: string;
    style?: string;
    search?: string;
  }): Promise<{ data: HouseProject[]; total: number }> {
    const { limit = 10, offset = 0, status, category, style, search } = options || {};

    const collection = await getHouseProjectsCollection();
    const query: any = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (style) query.style = style;
    
    if (search) {
      // Full-Text Search using $text (requires a text index setup)
      query.$text = { $search: search }; 
    }

    // Get total count
    const total = await collection.countDocuments(query);

    // Get paginated data
    const documents = await collection
      .find(query)
      .sort({ createdAt: -1 }) // -1 for descending order
      .skip(offset)
      .limit(limit)
      .toArray();

    // Map _id back to 'id'
    const data = documents.map(doc => {
        const { _id, ...rest } = doc;
        return { id: _id, ...rest } as HouseProject;
    });

    return { data, total };
  },

  // UPDATE
  async update(id: string, data: Partial<HouseProject>): Promise<void> {
    const collection = await getHouseProjectsCollection();
    const now = new Date();
    
    const updateDocument: any = { 
        $set: { ...data, updatedAt: now } 
    };
    delete updateDocument.$set.id; 

    const result = await collection.updateOne(
      { _id: id },
      updateDocument
    );

    if (result.matchedCount === 0) {
        throw new Error("Project not found");
    }
  },

  // DELETE
  async delete(id: string): Promise<void> {
    const collection = await getHouseProjectsCollection();
    
    const result = await collection.deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
         throw new Error("Project not found or already deleted");
    }
  },
};