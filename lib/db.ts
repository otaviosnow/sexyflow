import mongoose from 'mongoose';

// Extend global to include mongoose
declare global {
  var mongoose: any;
}

const MONGODB_URI = process.env.MONGODB_URI;

// Em desenvolvimento local, não exigir MongoDB
const isLocalDev = process.env.NODE_ENV === 'development' || process.env.NEXTAUTH_URL?.includes('localhost');

if (!MONGODB_URI && !isLocalDev) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Em desenvolvimento local, retornar conexão mock
  if (isLocalDev && !MONGODB_URI) {
    console.log('🔧 Modo de desenvolvimento local - usando conexão mock do MongoDB');
    return {
      connection: { readyState: 1 },
      models: {},
      model: () => ({}),
      disconnect: () => Promise.resolve()
    };
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
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
