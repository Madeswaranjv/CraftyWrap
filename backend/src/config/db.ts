import mongoose from 'mongoose';
import { autoSeedIfNeeded } from '../seed';

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add your MongoDB Atlas URI to backend/.env.');
  }

  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
    await autoSeedIfNeeded();
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}

