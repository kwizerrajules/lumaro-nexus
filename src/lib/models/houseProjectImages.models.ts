/**
 * Legacy MySQL blob image model.
 * New uploads go to Cloudinary; only secure_url strings are stored on house_projects
 * (MongoDB thumbnail / additionalImages). Do not insert binary blobs for new projects.
 */
import crypto from "crypto";
import db from "../db";

type InsertImageParams = {
  id?: string;
  houseproject_id: string;
  type: string;
  /** @deprecated Prefer storing Cloudinary URLs on the project document instead */
  image: Buffer | string;
  filename: string;
};

export const HouseProjectImagesModel = {
  async insertImage({ id, houseproject_id, type, image, filename }: InsertImageParams) {
    const imageId = id ?? crypto.randomUUID();

    await db.query(
      `INSERT INTO houseproject_images (id, houseproject_id, type, image, filename)
       VALUES (?, ?, ?, ?, ?)`,
      [imageId, houseproject_id, type, image, filename]
    );
  },
};
