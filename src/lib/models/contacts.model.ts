import {ContactUs} from "@/utils/interfaces";
import db from '../db'
import crypto from "crypto";


export const ContactUsModel = {
    async createCOntact({id, names, email, phone, message}: ContactUs){
        const contactId = id ?? crypto.randomUUID();

        await db.query(
            `INSERT INTO contacts (id, names, email, phone, messafe) VALUES (?,?,?,?,?)`,[contactId, names, email, phone, message]
        )
    } 
}