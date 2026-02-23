import dotenv from 'dotenv'
import app from '../server/app.js'
import { connectDB } from '../server/config/db.js'

dotenv.config()

export default async function handler(req, res) {
  try {
    await connectDB()
    return app(req, res)
  } catch (error) {
    console.error('API handler error:', error)
    return res.status(500).json({ message: 'Server failed to initialize' })
  }
}
