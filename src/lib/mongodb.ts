import { MongoClient } from "mongodb";

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

function getClientPromise(): Promise<MongoClient> {
  if (!process.env.MONGODB_URI) {
    throw new Error("Please add your Mongo URI to .env");
  }

  if (process.env.NODE_ENV === "development") {
    // Avoid multiple connections in dev
    if (!(global as any)._mongoClientPromise) {
      client = new MongoClient(process.env.MONGODB_URI, options);
      (global as any)._mongoClientPromise = client.connect();
    }
    return (global as any)._mongoClientPromise;
  } else {
    client = new MongoClient(process.env.MONGODB_URI, options);
    return client.connect();
  }
}

export default getClientPromise;
