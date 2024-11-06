import crypto from 'crypto'
import type { User } from '~/types'
import mongodb from '~/lib/mongodb.server'
import { ObjectId } from 'mongodb'

if (!process.env.MONGODB_DBNAME) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_DBNAME"')
}

if (!process.env.MONGODB_COLL_USERS) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_COLL_USERS"')
}

const dbName = process.env.MONGODB_DBNAME
const collUsers = process.env.MONGODB_COLL_USERS

export async function createUser(
  name: string,
  email: string,
  password: string
) {
  try {
    const client = await mongodb()
    const collection = client.db(dbName).collection<User>(collUsers)
    const user = await collection.findOne({ email })

    if (user) {
      return {
        error: 'The email address already exists.',
        data: null,
      }
    }

    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
      .toString('hex')

    const { insertedId } = await collection.insertOne({
      createdAt: new Date(),
      name,
      email,
      password: {
        salt,
        hash,
      },
    })

    return {
      error: null,
      data: insertedId.toString(),
    }
  } catch (error) {
    return {
      error: 'An unexpected error occured.',
      data: null,
    }
  }
}

export async function deleteUser(id: string) {
  try {
    const client = await mongodb()
    const collection = client.db(dbName).collection<User>(collUsers)
    const user = await collection.findOne({ _id: new ObjectId(id) })

    if (!user) {
      return {
        error: 'User not found.',
        data: null,
      }
    }

    await collection.deleteOne({ _id: new ObjectId(id) })

    return {
      error: null,
      data: 'User deleted successfully.',
    }
  } catch (error) {
    return {
      error: 'An unexpected error occured.',
      data: null,
    }
  }
}

export async function authenticateUser(email: string, password: string) {
  try {
    const client = await mongodb()
    const collection = client.db(dbName).collection<User>(collUsers)
    const user = await collection.findOne({ email })

    if (!user) {
      return {
        error: 'Incorrect email or password.',
        data: null,
      }
    }

    const hash = crypto
      .pbkdf2Sync(password, user.password.salt, 100000, 64, 'sha512')
      .toString('hex')

    if (hash !== user.password.hash) {
      return {
        error: 'Incorrect email or password.',
        data: null,
      }
    }

    return {
      error: null,
      data: user._id.toString(),
    }
  } catch (error) {
    return {
      error: 'An unexpected error occured.',
      data: null,
    }
  }
}

export async function getUser(id: string) {
  try {
    const client = await mongodb()
    const collection = client.db(dbName).collection<User>(collUsers)
    const user = await collection.findOne({
      _id: new ObjectId(id),
    })

    if (!user) {
      return {
        error: 'User not found.',
        data: null,
      }
    }

    return {
      error: null,
      data: user,
    }
  } catch (error) {
    return {
      error: 'An unexpected error occured.',
      data: null,
    }
  }
}

export async function initiatePasswordReset(email: string) {
  try {
    const client = await mongodb()
    const collection = client.db(dbName).collection<User>(collUsers)
    const user = await collection.findOne({ email })

    if (!user) {
      return {
        error:
          'If an account exists for this email, a password reset link will be sent.',
        data: null,
      }
    }

    const token = crypto.randomBytes(32).toString('hex')

    await collection.updateOne(
      { email },
      {
        $set: {
          forgotPasswordToken: token,
          forgotPasswordTokenExpireAt: Date.now() + 1000 * 60 * 60,
        },
      }
    )

    return {
      error: null,
      data: token,
    }
  } catch (error) {
    return {
      error: 'An unexpected error occured.',
      data: null,
    }
  }
}

export async function updatePassword(token: string, password: string) {
  try {
    const client = await mongodb()
    const collection = client.db(dbName).collection<User>(collUsers)
    const user = await collection.findOne({
      forgotPasswordToken: token,
    })

    if (!user) {
      return {
        error: 'Token is not valid.',
        data: null,
      }
    }

    if (Date.now() > (user.forgotPasswordTokenExpireAt ?? 0)) {
      return {
        error: 'Token has expired.',
        data: null,
      }
    }

    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
      .toString('hex')

    await collection.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          password: {
            salt,
            hash,
          },
        },
        $unset: {
          forgotPasswordToken: '',
          forgotPasswordTokenExpiryDate: '',
        },
      }
    )

    return {
      error: null,
      data: user._id.toString(),
    }
  } catch (error) {
    return {
      error: 'An unexpected error occured.',
      data: null,
    }
  }
}
