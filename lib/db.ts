import mongoose from 'mongoose';

// Force IPv4 (127.0.0.1) instead of IPv6 (::1) to avoid ECONNREFUSED errors
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pocketguard-ai';

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
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of default 30s
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 to prevent ::1 (IPv6) connection errors
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB successfully');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB Connection Error:', error.message);
      
      if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
        console.error('\n📋 Solutions possibles:');
        console.error('1. Vérifiez que MongoDB est démarré:');
        console.error('   - Windows: net start MongoDB (en tant qu\'administrateur)');
        console.error('   - macOS/Linux: sudo systemctl start mongod');
        console.error('\n2. Vérifiez votre MONGODB_URI dans .env.local:');
        console.error('   - Local: MONGODB_URI=mongodb://127.0.0.1:27017/pocketguard-ai');
        console.error('   - Atlas: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db');
        console.error('\n3. Si vous utilisez MongoDB Atlas (cloud), assurez-vous:');
        console.error('   - D\'avoir whitelisté votre adresse IP');
        console.error('   - Que vos identifiants sont corrects');
      }
      
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;


