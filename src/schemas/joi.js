import Joi from '@hapi/joi';
import mongoose from 'mongoose';

/********* ********* ********* ********* ********* ********* ********* ********* *********
 custom joi validation
 ********* ********* ********* ********* ********* ********* ********* ********* *********/
const customJoi = {
  name: 'string',
  base: Joi.string(),
  language: {
    objectId: 'must be a valid Object ID'

    /********* ********* ********* ********* ********* ********* ********* ********* *********
     it can be addable more validation key here
     ********* ********* ********* ********* ********* ********* ********* ********* *********/
  },
  rules: [{
    name: 'objectId',
    validate(params, value, state, options) {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return this.createError('string.objectId', {}, state, options)
      }
      return value
    }
  },

    /********* ********* ********* ********* ********* ********* ********* ********* *********
     more rule of custom validation
     ********* ********* ********* ********* ********* ********* ********* ********* *********/
  ]
};

export default Joi.extend(customJoi)