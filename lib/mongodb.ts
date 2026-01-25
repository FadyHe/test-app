import mongoose, { Connection } from 'mongoose'

// Cache connection to prevent multiple connections during development
interface CachedConnection {
  conn: Connection | null
  promise: Promise<Connection> | null
}

const globalWithMongo = global as typeof globalThis & {
  mongoose: CachedConnection
}

if (!globalWithMongo.mongoose) {
  globalWithMongo.mongoose = { conn: null, promise: null }
}

const cached = globalWithMongo.mongoose

/**
 * Connect to MongoDB using Mongoose
 * Implements connection caching to prevent multiple connections in development
 * @returns Promise resolving to the Mongoose Connection object
 * @throws Error if MONGODB_URI is not defined or connection fails
 */
export async function connectDB(): Promise<Connection> {
  // Return cached connection if available
  if (cached.conn) {
    return cached.conn
  }

  // Return pending promise if connection is in progress
  if (cached.promise) {
    return cached.promise
  }

  // Validate MongoDB URI
  const mongodbUri = process.env.MONGODB_URI
  if (!mongodbUri) {
    throw new Error('MONGODB_URI environment variable is not defined')
  }

  // Create new connection promise
  cached.promise = mongoose
    .connect(mongodbUri, {
      bufferCommands: false,
    })
    .then((mongoose) => {
      return mongoose.connection
    })
    .catch((error) => {
      cached.promise = null
      throw error
    })

  try {
    cached.conn = await cached.promise
  } catch (error) {
    cached.promise = null
    throw error
  }

  return cached.conn
}

/**
 * Disconnect from MongoDB
 * Useful for testing or graceful shutdown
 */
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await cached.conn.close()
    cached.conn = null
    cached.promise = null
  }
}

export default connectDB
