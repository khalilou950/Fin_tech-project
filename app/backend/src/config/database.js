import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Force IPv4 by replacing localhost with 127.0.0.1 if needed
    let mongoUri = process.env.MONGODB_URI;
    if (mongoUri && mongoUri.includes('localhost')) {
      mongoUri = mongoUri.replace('localhost', '127.0.0.1');
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

