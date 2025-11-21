import getClientPromise from "../mongodb";
import { Collection } from "mongodb";
import crypto from "crypto";

type ContactUsParams = {
    id?: string;
    names: string;
    email: string;
    phone?: string;
    message: string;
};

// Internal Document Type
interface ContactDocument extends Omit<ContactUsParams, 'id'> {
    _id: string;
    createdAt: Date;
}


const COLLECTION_NAME = "contacts";
const DB_NAME = "LUMARO"; 

async function getContactsCollection(): Promise<Collection<ContactDocument>> {
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    return db.collection<ContactDocument>(COLLECTION_NAME);
}

export const ContactUsModel = {
    async insertContactUs({ id, names, email, phone, message }: ContactUsParams) {
        const contactId = id ?? crypto.randomUUID();
        const collection = await getContactsCollection();
        const now = new Date();

        const newContact: ContactDocument = {
            _id: contactId,
            names,
            email,
            phone,
            message,
            createdAt: now,
        };

        await collection.insertOne(newContact as any);
        
        return { 
            id: contactId, 
            names, 
            email, 
            phone, 
            message, 
            createdAt: now 
        };
    },

    async getAllContacts(): Promise<ContactUsParams[]> {
        const collection = await getContactsCollection();

        const documents = await collection.find({})
            .sort({ createdAt: -1 })
            .toArray();

        return documents.map(doc => {
            const { _id, createdAt, ...rest } = doc;
            return {
                id: _id,
                ...rest
            }
        });
    }

}