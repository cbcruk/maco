import { MongoClient, ServerApiVersion } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: `MONGODB_URI`')
}

type MongoClientConstructorParameters = ConstructorParameters<
  typeof MongoClient
>

class ClientError extends Error {
  constructor() {
    super('`db.client` is `undefined`')
  }
}

const db = {
  uri: process.env.MONGODB_URI,
  options: {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  },
  client: undefined,
  clientPromise: undefined,
  isConnected: false,
} as {
  uri: MongoClientConstructorParameters[0]
  options: MongoClientConstructorParameters[1]
  client?: MongoClient
  clientPromise?: Promise<MongoClient>
  isConnected: boolean
}

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
    _mongoClient?: MongoClient
  }

  if (!globalWithMongo._mongoClientPromise || !globalWithMongo._mongoClient) {
    db.client = new MongoClient(db.uri, db.options)

    globalWithMongo._mongoClient = db.client
    globalWithMongo._mongoClientPromise = db.client.connect()
  }

  db.client = globalWithMongo._mongoClient
  db.clientPromise = globalWithMongo._mongoClientPromise
} else {
  db.client = new MongoClient(db.uri, db.options)

  const connectWithRetry = async (
    attempt = 1,
    maxAttempts = 5
  ): Promise<MongoClient> => {
    const delay = Math.pow(5, attempt) * 1000

    try {
      if (!db.client) {
        throw new ClientError()
      }

      return await db.client.connect()
    } catch (error) {
      console.error(
        `Error connecting to MongoDB (Attempt ${attempt}/${maxAttempts}):`,
        error
      )

      if (attempt < maxAttempts) {
        console.log(`Retrying in ${delay / 1000} seconds...`)

        return new Promise((resolve) => setTimeout(resolve, delay)).then(() =>
          connectWithRetry(attempt + 1, maxAttempts)
        )
      } else {
        console.error(
          `Maximum retry attempts (${maxAttempts}) reached. Connection failed.`
        )

        throw error
      }
    }
  }

  db.clientPromise = connectWithRetry()
}

async function mongodb(): Promise<MongoClient> {
  if (db.isConnected && db.client) {
    return db.client
  }

  try {
    db.client = await db.clientPromise

    if (!db.client) {
      throw new ClientError()
    }

    await db.client.db('admin').command({ ping: 1 })

    db.isConnected = true

    return db.client
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)

    db.isConnected = false

    throw error
  }
}

export default mongodb
