import { model, Schema } from 'mongoose'
import { hash, compare } from 'bcryptjs'

const { ObjectId } = Schema.Types

const userSchema = new Schema({
    username: {
      type: String,
      validate: {
        validator: (username) => User.doesntExist({ username }),
        message: (props) => `${props.value} has already taken`,
      }
    },
    email: {
      type: String,
      validate: {
        validator: (email) => User.doesntExist({ email }),
        message: (props) => `${props.value} has already taken`,
      }
    },
    password: String,
    refreshToken: String,

    /********* ********* ********* ********* ********* ********* ********* ********* *********
     ex: roles:[admin, user, ...]
     ********* ********* ********* ********* ********* ********* ********* ********* *********/
    roles: {
      type: [String],
      default: "user",
    }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false
    }
  }
)

/********* ********* ********* ********* ********* ********* ********* ********* *********
 mongoose must use function(){}
 because of this match
 ********* ********* ********* ********* ********* ********* ********* ********* *********/

/********* ********* ********* ********* ********* ********* ********* ********* *********
 mongoose static methods
 ********* ********* ********* ********* ********* ********* ********* ********* *********/
userSchema.statics.doesntExist = async function (option) {
  return await this.where(option).countDocuments() === 0
}

/********* ********* ********* ********* ********* ********* ********* ********* *********
 mongoose pre methods
 ********* ********* ********* ********* ********* ********* ********* ********* *********/
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      this.password = await hash(this.password, 12)
      next()
    } catch (err) {
      next(err)
    }
  }
  next()
})
/********* ********* ********* ********* ********* ********* ********* ********* *********
 findByIdAndUpdate doesn't work with pre methods
 updateOne do not return new doc.
 ********* ********* ********* ********* ********* ********* ********* ********* *********/
userSchema.pre("findOneAndUpdate", async function (next) {
  let update = this.getUpdate();
  if (!update.$set.password) {
    return next();
  }

  try {
    this.update({}, { $set: { password: await hash(update.$set.password, 12) } });
    next()
  } catch (err) {
    next(err)
  }
  next()
});
/********* ********* ********* ********* ********* ********* ********* ********* *********
 mongoose methods can use out of schema
 ********* ********* ********* ********* ********* ********* ********* ********* *********/
userSchema.methods.matchesPassword = async function (password) {
  return await compare(password, this.password)
}

export const User = model('User', userSchema)

