import Joi from '@hapi/joi'

/********* ********* ********* ********* ********* ********* ********* ********* *********
 for using customJoi to import first
 ********* ********* ********* ********* ********* ********* ********* ********* *********/
import customJoi from './joi'

const username = Joi.string().alphanum().min(3).max(30).required().label('username')
const email = Joi.string().email().required().label('email')
const password = Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required().options({
  language: {
    string: {
      regex: {
        base: '잘못된 압호입니다.'
      }
    }
  }
}).label('password')
const currentPassword = Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required().options({
  language: {
    string: {
      regex: {
        base: '잘못된 압호입니다.'
      }
    }
  }
}).label('currentPassword')
const confirmPassword = Joi.any().equal(Joi.ref('password')).required().label('confirmPassword')

export const register = Joi.object().keys({
  username,
  email,
  password,
  confirmPassword,
})

export const login = Joi.object().keys({
  username,
  password,
})

export const updateUser = Joi.object().keys({
  email,
  currentPassword,
  password,
  confirmPassword,
})

export const editPassword = Joi.object().keys({
  currentPassword,
  password,
  confirmPassword,
})

/********* ********* ********* ********* ********* ********* ********* ********* *********
 see how to customJoi is used
 ********* ********* ********* ********* ********* ********* ********* ********* *********/
export const getUser = customJoi.object().keys({
  id: customJoi.string().objectId()
})