import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) throw new Error("Please define MONGODB_URI in .env.local");

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend globalThis to allow custom `mongoose` property
declare global {
  var mongoose: MongooseCache | undefined;
}

const globalCache = global.mongoose ?? {
  conn: null,
  promise: null
};

global.mongoose = globalCache;

async function dbConnect() {
  if (globalCache.conn) return globalCache.conn;

  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}

export default dbConnect;
