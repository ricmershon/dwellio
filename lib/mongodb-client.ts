import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error("Missing MONGODB_URI");
}

type GlobalWithMongo = typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as GlobalWithMongo;

const client = new MongoClient(uri);
export const clientPromise: Promise<MongoClient> =
     globalForMongo._mongoClientPromise ?? client.connect();

if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = clientPromise;
}

export default clientPromise;