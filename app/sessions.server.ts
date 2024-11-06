import {
  Cookie,
  createCookie,
  createSessionStorage,
  SessionStorage,
} from '@remix-run/node'
import { ObjectId } from 'mongodb'
import mongodb from '~/lib/mongodb.server'

if (!process.env.MONGODB_DBNAME) {
  throw new Error('Invalid/Missing environment variable: `MONGODB_DBNAME`')
}

if (!process.env.MONGODB_COLL_SESSIONS) {
  throw new Error(
    'Invalid/Missing environment variable: `MONGODB_COLL_SESSIONS`'
  )
}

if (
  !process.env.SESSION_SECRET_CURRENT ||
  !process.env.SESSION_SECRET_PREVIOUS ||
  !process.env.SESSION_SECRET_OLD
) {
  throw new Error(
    'Invalid/Missing environment variables for session cookie signing: `SESSION_SECRET_CURRENT`, `SESSION_SECRET_PREVIOUS`, `SESSION_SECRET_OLD`.'
  )
}

interface SessionData {
  _id: string
}

interface MongoDBSessionStorage {
  cookie: Cookie
  options: {
    db: string | undefined
    coll: string
  }
}

const db = {
  name: process.env.MONGODB_DBNAME,
  sessionCollectionName: process.env.MONGODB_COLL_SESSIONS,
}

const secrets = [
  process.env.SESSION_SECRET_CURRENT,
  process.env.SESSION_SECRET_PREVIOUS,
  process.env.SESSION_SECRET_OLD,
]

const cookie = createCookie('__session', {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 30,
  sameSite: 'lax',
  secrets,
  secure: process.env.NODE_ENV === 'production',
})

async function createMongoDBSessionStorage({
  cookie,
  options,
}: MongoDBSessionStorage) {
  const client = await mongodb()
  const collection = client.db(options.db).collection(options.coll)

  await collection.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 })

  return createSessionStorage<SessionData>({
    cookie,
    async createData(data, expires) {
      let _id: ObjectId | null = null
      const { _id: _, ...dataWithoutId } = data

      if (data._id) {
        _id = new ObjectId(data._id)

        await collection.findOneAndUpdate(
          { _id: new ObjectId(_id) },
          { $set: { ...dataWithoutId, expireAt: expires } },
          { upsert: true }
        )
      } else {
        const { insertedId } = await collection.insertOne({
          ...dataWithoutId,
          expireAt: expires,
        })

        _id = insertedId
      }

      return _id.toString()
    },
    async readData(id) {
      const session = await collection.findOne({
        _id: new ObjectId(id),
      })

      return session ? { _id: session._id.toString() } : null
    },
    async updateData(id, data, expires) {
      const { _id: _, ...dataWithoutId } = data

      if (!data._id || data._id === id) {
        await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { ...dataWithoutId, expireAt: expires } },
          { upsert: true }
        )

        return
      }

      await collection.deleteOne({ _id: new ObjectId(id) })
      await collection.insertOne({
        ...data,
        _id: new ObjectId(data._id),
        expireAt: expires,
      })
    },
    async deleteData(id) {
      await collection.deleteOne({ _id: new ObjectId(id) })
    },
  })
}

const sessionStorage = createMongoDBSessionStorage({
  cookie,
  options: {
    db: db.name,
    coll: db.sessionCollectionName,
  },
})

export const getSession: SessionStorage['getSession'] = async (...args) =>
  (await sessionStorage).getSession(...args)

export const commitSession: SessionStorage['commitSession'] = async (...args) =>
  (await sessionStorage).commitSession(...args)

export const destroySession: SessionStorage['destroySession'] = async (
  ...args
) => (await sessionStorage).destroySession(...args)
