// src/lib/db.ts
import mongoose from "mongoose";
import "dotenv/config";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ Missing MONGODB_URI in .env");
}

// Define a cached object type
interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use global to persist the cache across hot reloads in dev
declare global {
  var mongooseCache: Cached | undefined;
}

const cached: Cached = global.mongooseCache || { conn: null, promise: null };
global.mongooseCache = cached;

export default async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    try {
      cached.promise = mongoose
        .connect(MONGODB_URI!, {
          bufferCommands: false,
          serverSelectionTimeoutMS: 10000, // ⏳ fail fast on bad DNS
          maxPoolSize: 10, // connection pool
        })
        .then((mongoose) => mongoose);
    } catch (err) {
      console.error("❌ Initial MongoDB connection error:", err);
      throw err;
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);

    // Optional: fallback if SRV fails and you provided a STANDARD connection URI
    if (process.env.MONGODB_URI_FALLBACK) {
      console.log("🔁 Trying fallback MongoDB URI...");
      cached.promise = mongoose
        .connect(process.env.MONGODB_URI_FALLBACK, {
          bufferCommands: false,
          serverSelectionTimeoutMS: 10000,
        })
        .then((mongoose) => mongoose);

      cached.conn = await cached.promise;
    } else {
      throw err;
    }
  }

  return cached.conn;
}
