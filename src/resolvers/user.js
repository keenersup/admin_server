import { UserInputError } from 'apollo-server'
import { normalizeErrors } from "../utils/normalizeErrors";
import Joi from '@hapi/joi'
import { register, login, getUser, updateUser, editPassword } from "../schemas";
import { REFRESH_SECRET_KEY, SECRET_KEY } from "../../config";
import { generateTokens, refreshTokens } from "../utils/generateToken";
import jwt from 'jsonwebtoken'
import find from "graphql/polyfills/find";

export default {
  Query: {

    /********* ********* ********* ********* ********* ********* ********* ********* *********
     todo: allUsers for only admin
     ********* ********* ********* ********* ********* ********* ********* ********* *********/
    allUsers: async (_, args, { models }) => {
      try {
        return await models.User.find({})
      } catch (err) {
        const errors = normalizeErrors(err)
        throw new UserInputError('allUsers error', { errors })
      }
    },

    /********* ********* ********* ********* ********* ********* ********* ********* *********
     todo: getUser fixed for authed user
     ********* ********* ********* ********* ********* ********* ********* ********* *********/
    getUser: async (_, { id }, { models }) => {
      try {
        const user = await models.User.findById(id)
        if (!user) {
          throw { user: 'no user' }
        }
        return {
          ...user._doc,
          id: user._id,
        }
      } catch (err) {
        const errors = normalizeErrors(err)
        throw new UserInputError('getUser error', { errors })
      }
    },

  },

  Mutation: {
    register: async (_, { registerInput: { username, email, password, confirmPassword, clientId } }, { models, user }) => {
      try {
        await Joi.validate({ username, email, password, confirmPassword }, register, { abortEarly: false })

        /********* ********* ********* ********* ********* ********* ********* ********* *********
         todo: refreshToken save in object field and check with Fingerprint id
         ********* ********* ********* ********* ********* ********* ********* ********* *********/
        const refreshSecret = password + REFRESH_SECRET_KEY

        /********* ********* ********* ********* ********* ********* ********* ********* *********
         after new User create
         then generate token
         then save with refreshToken
         ********* ********* ********* ********* ********* ********* ********* ********* *********/
        const newUser = await new models.User({
          username, email, password
        })

        /********* ********* ********* ********* ********* ********* ********* ********* *********
         if administor register for create administor admin
         ********* ********* ********* ********* ********* ********* ********* ********* *********/
        if (user && user.roles.includes("admin")) {
          newUser.roles = ["user", "admin"]
          await newUser.save()
          return {
            ...newUser._doc,
            id: newUser._id,
          }
        }
        /********* ********* ********* ********* ********* ********* ********* ********* *********
         if client id is not given
         ********* ********* ********* ********* ********* ********* ********* ********* *********/
        const [accessToken, refreshToken] = generateTokens(newUser, SECRET_KEY, refreshSecret, clientId);
        newUser.refreshToken = refreshToken;
        await newUser.save()

        return {
          ...newUser._doc,
          id: newUser._id,
          accessToken,
        }

      } catch (err) {
        const errors = normalizeErrors(err)
        throw new UserInputError('register mutation', { errors })
      }
    },

    login: async (_, { username, password, clientId }, { models }) => {

      /********* ********* ********* ********* ********* ********* ********* ********* *********
       error message path match to joi validation
       ********* ********* ********* ********* ********* ********* ********* ********* *********/
      try {
        await Joi.validate({ username, password }, login, { abortEarly: false })

        const user = await models.User.findOne({ username })
        if (!user) {
          throw { username: 'username not found' }
        }

        if (!await user.matchesPassword(password)) {
          throw { password: 'Wrong credentials' }
        }

        /********* ********* ********* ********* ********* ********* ********* ********* *********
         todo: refreshToken save in object field and check with Fingerprint id
         ********* ********* ********* ********* ********* ********* ********* ********* *********/
        const refreshSecret = user.password + REFRESH_SECRET_KEY
        const [accessToken, refreshToken] = generateTokens(user, SECRET_KEY, refreshSecret, clientId)

        /********* ********* ********* ********* ********* ********* ********* ********* *********
         after find user and mongoose updateOne method to update refreshToken
         must $set option take
         ********* ********* ********* ********* ********* ********* ********* ********* *********/
        await user.updateOne({ $set: { refreshToken } }, { new: true })

        return {
          ...user._doc,
          id: user._id,
          accessToken,
        }
      } catch (err) {
        const errors = normalizeErrors(err)
        throw new UserInputError('login mutation', { errors })
      }
    },


    /********* ********* ********* ********* ********* ********* ********* ********* *********
     todo: updateUser fixed
     ********* ********* ********* ********* ********* ********* ********* ********* *********/
    updateUser: async (_, { updateUserInput }, { models, user }) => {

      const { email, currentPassword, password, confirmPassword, clientId } = updateUserInput

      const updateObj = {}
      Object.keys(updateUserInput).forEach(key => {
        if (key === 'password') {
          updateObj[key] = updateUserInput[key]
        }
      })

      try {
        await Joi.validate({ email, currentPassword, password, confirmPassword }, updateUser, { abortEarly: false })

        /********* ********* ********* ********* ********* ********* ********* ********* *********
         todo: seperate module, or use login resolver for check password matches
         ********* ********* ********* ********* ********* ********* ********* ********* *********/
        const foundUser = await models.User.findById(user.id)

        if (!await foundUser.matchesPassword(updateUserInput.currentPassword)) {
          throw { currentPassword: "not matched" }
        }
        const updatedUser = await models.User.findOneAndUpdate({ _id: user.id }, { $set: updateObj }, { new: true })

        const refreshSecret = updatedUser.password + REFRESH_SECRET_KEY
        const [accessToken, refreshToken] = generateTokens(user, SECRET_KEY, refreshSecret, clientId)

        await updatedUser.updateOne({ $set: { refreshToken } })

        return {
          ...updatedUser._doc,
          id: updatedUser._id,
          accessToken,
        }

      } catch (err) {
        const errors = normalizeErrors(err)
        throw new UserInputError('updateUser error', { errors })
      }
    },

    editPassword: async (_, { editPasswordInput }, { models, user }) => {

      const { currentPassword, password, confirmPassword, clientId } = editPasswordInput

      try {
        await Joi.validate({ currentPassword, password, confirmPassword }, editPassword, { abortEarly: false })

        const foundUser = await models.User.findById(user.id)

        if (!await foundUser.matchesPassword(currentPassword)) {
          throw { currentPassword: "not matched" }
        }

        if (await foundUser.matchesPassword(password)) {
          throw { password: "same password" }
        }

        const updatedUser = await models.User.findOneAndUpdate({ _id: user.id }, { $set: { password } }, { new: true })
        const refreshSecret = updatedUser.password + REFRESH_SECRET_KEY
        const [accessToken, refreshToken] = generateTokens(user, SECRET_KEY, refreshSecret, clientId)

        await updatedUser.updateOne({ $set: { refreshToken } })

        return {
          ...updatedUser._doc,
          id: updatedUser._id,
          accessToken,
        }

      } catch (err) {
        const errors = normalizeErrors(err)
        throw new UserInputError('updateUser error', { errors })
      }
    },

    deleteUser: async (_, { id }, { models }) => {
      try {

        /********* ********* ********* ********* ********* ********* ********* ********* *********
         !! makes result to Boolean
         ********* ********* ********* ********* ********* ********* ********* ********* *********/
        return !!await models.User.findByIdAndRemove(id)
      } catch (err) {
        const errors = normalizeErrors(err)
        throw new UserInputError('deleteUser error', { errors })
      }
    },
    refreshToken: async (_, { accessToken, clientId }, { models, req }) => {
      try {
        const decodedUser = await jwt.decode(accessToken)
        if (!decodedUser) {
          throw { decoded: 'can not decoded' }
        }
        const user = await models.User.findById(decodedUser.id)
        if (!user) {
          throw { user: 'user not found' }
        }

        const [newAccessToken, newRefreshToken] = await refreshTokens(accessToken, user, clientId, req)
        await user.updateOne({ $set: { refreshToken: newRefreshToken } })

        return {
          accessToken: newAccessToken
        }
      } catch (err) {
        const errors = normalizeErrors(err)
        throw new UserInputError('refreshToken error', { errors })
      }
    },
  },
}