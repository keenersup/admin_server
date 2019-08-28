import mongoose from 'mongoose'
import {
  DB_USERNAME,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} from '../../config'

const connect = () => {
  return mongoose.connect(`mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
}

export const mongooseConnect = () => {
  connect()
  const db = mongoose.connection

  db.on('error', console.error.bind(console, 'DB error: '))
  db.once('open', () => {
    console.log('DB connect');
  })
  db.on('disconnected', () => {
    console.error('DB reconnect')
    setInterval(() => {
      connect()
    }, 5000)
  })
}