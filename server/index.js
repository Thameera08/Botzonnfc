import dotenv from 'dotenv'
import app from './app.js'
import { connectDB } from './config/db.js'

dotenv.config()

const port = Number(process.env.PORT || 5050)

const startServer = async () => {
  await connectDB()
  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`)
  })
}

startServer().catch((error) => {
  console.error('Unable to start server', error)
  process.exit(1)
})
