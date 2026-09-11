import mongoose from 'mongoose'

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI

  if (primaryUri) {
    try {
      const conn = await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 5000 })
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
      return
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.warn(`⚠️ Primary MongoDB connection failed (${msg}).`)
      console.warn('⚡ Falling back to local in-memory MongoDB for seamless development…')
    }
  }

  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server')
    const mongoServer = await MongoMemoryServer.create()
    const fallbackUri = mongoServer.getUri()
    const conn = await mongoose.connect(fallbackUri)
    console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`)
  } catch (fallbackError) {
    console.error('❌ Failed to initialize MongoDB connection:', fallbackError)
    process.exit(1)
  }
}

export default connectDB