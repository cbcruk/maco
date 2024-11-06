import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  createdAt: Date
  name: string
  email: string
  password: {
    salt: string
    hash: string
  }
  forgotPasswordToken?: string
  forgotPasswordTokenExpireAt?: number
}
