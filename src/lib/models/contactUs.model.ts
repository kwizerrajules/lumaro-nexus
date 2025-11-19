import db from "../db";
import crypto from "crypto";

type ContactUsParams = {
    id?: string;
    names: string;
    email: string;
    phone?: string;
    message: string;
};

export const ContactUsModel = {
    async insertContactUs({ id, names, email, phone, message }: ContactUsParams) {
        const contactId = id ?? crypto.randomUUID();
        
        await db.query(
            `INSERT INTO contacts (id, names, email, phone, message)
                VALUES (?, ?, ?, ?, ?)`,
                [contactId, names, email, phone, message]
            );
        },
    async getAllContacts() {
        const [rows]: any = await db.query("SELECT * FROM contacts");
        return rows;
    }

}






