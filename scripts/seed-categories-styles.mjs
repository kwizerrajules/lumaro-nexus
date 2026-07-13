/**
 * One-off seed: categories + nested styles
 * Run: node scripts/seed-categories-styles.mjs
 */
import 'dotenv/config';
import { MongoClient } from 'mongodb';
import crypto from 'crypto';

const DB_NAME = 'LUMARO';

const DATA = {
  Residential: ['Villas', 'Apartments', 'Gated Communities', 'Housing Developments'],
  Commercial: ['Offices', 'Retail', 'Banks', 'Restaurants', 'Showrooms'],
  Hospitality: ['Hotels', 'Lodges', 'Resorts', 'Guest Houses'],
  Institutional: ['Schools', 'Universities', 'Clinics', 'Hospitals', 'Churches', 'Government'],
  Industrial: ['Warehouses', 'Factories', 'Logistics', 'Cold Rooms'],
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing');

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(DB_NAME);
  const categories = db.collection('categories');
  const styles = db.collection('styles');

  for (const [categoryName, styleNames] of Object.entries(DATA)) {
    const nameLower = categoryName.toLowerCase();
    let category = await categories.findOne({ nameLower });

    if (!category) {
      const now = new Date();
      category = {
        _id: crypto.randomUUID(),
        name: categoryName,
        nameLower,
        createdAt: now,
        updatedAt: now,
      };
      await categories.insertOne(category);
      console.log('Created category:', categoryName);
    } else {
      console.log('Category exists:', categoryName);
    }

    for (const styleName of styleNames) {
      const styleLower = styleName.toLowerCase();
      const existing = await styles.findOne({
        categoryId: category._id,
        nameLower: styleLower,
      });

      if (existing) {
        console.log('  = style exists:', styleName);
        continue;
      }

      const now = new Date();
      await styles.insertOne({
        _id: crypto.randomUUID(),
        name: styleName,
        nameLower: styleLower,
        categoryId: category._id,
        categoryName: category.name,
        createdAt: now,
        updatedAt: now,
      });
      console.log('  + style:', styleName);
    }
  }

  await client.close();
  console.log('Done seeding categories and styles.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
