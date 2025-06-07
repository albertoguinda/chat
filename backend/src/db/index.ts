import { MongoClient } from "mongodb";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const client = new MongoClient(MONGO_URL);

export async function connectDB() {
  if (!client.topology?.isConnected()) {
    await client.connect();
  }
  return client.db("moontechchat");
}
