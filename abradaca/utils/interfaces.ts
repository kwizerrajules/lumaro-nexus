import { ZodEmail } from "zod";

export default interface ContactUs  {
    id: string,
    names: string,
    email: ZodEmail,
    phone?: string,
    message: string
}

