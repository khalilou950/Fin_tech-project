import mongoose from 'mongoose';

// NOTE:
// - In local dev, we default to a MongoDB instance on 127.0.0.1 (IPv4) to avoid ::1 (IPv6) connection issues.
// - In production (Vercel, etc.), you MUST set MONGODB_URI to your MongoDB Atlas connection string.
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://127.0.0.1:27017/pocketguard-ai?directConnection=true';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Force IPv4 connection to avoid ::1 (IPv6) connection issues
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      // Force IPv4 family
      family: 4,
    };

    if (process.env.NODE_ENV !== 'production') {
      console.log('[MongoDB] Attempting connection to:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[MongoDB] Connected successfully');
      }
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    console.error('MongoDB connection error:', e.message);
    throw new Error(`Failed to connect to MongoDB: ${e.message}`);
  }

  return cached.conn;
}

export default connectDB;

