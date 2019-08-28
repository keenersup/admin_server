import jwt from 'jsonwebtoken'
import { SECRET_KEY } from "../../config"
import { AuthenticationError } from 'apollo-server'

export const addUser = async (req) => {
  const header = req.headers.authorization
  if (header) {
    const accessToken = header.split('Bearer ')[1]
    if (accessToken) {
      try {
        return jwt.verify(accessToken, SECRET_KEY)
      } catch (errors) {
        throw new AuthenticationError('Not valid token')
      }
    } else {
      throw new AuthenticationError('Authentication token must be \'Bearer [token]')
    }
  }
  return null
}