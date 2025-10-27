import { ZodEmail } from "zod";

type InsertImageParams = { 
    id?: string; 
    houseproject_id: string; 
    type: string; 
    image: Buffer | string; 
    filename: string; 
};


type ContactUs = {
    id: string,
    names: string,
    email: ZodEmail,
    phone?: string,
    message: string
}
