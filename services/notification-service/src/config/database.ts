import { MongoClient, Db } from "mongodb"
import { logger } from "./logger"

const MONGO_URL = process.env.MONGODB_URL ?? "mongodb://nexabiz:nexabiz@localhost:27017/nexabiz_events"
let db: Db | null = null
let client: MongoClient | null = null

export async function getDb(): Promise<Db> {
  if (db) return db
  client = new MongoClient(MONGO_URL)
  await client.connect()
  db = client.db()
  logger.info("MongoDB connected (notification-service)")
  return db
}

export async function closeDb(): Promise<void> {
  await client?.close()
}
