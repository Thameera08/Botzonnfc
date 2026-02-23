import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { connectDB } from './config/db.js'
import adminRoutes from './routes/adminRoutes.js'
import publicRoutes from './routes/publicRoutes.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 5050)

const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
]

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true)

    const isAllowed = allowedOrigins.some((rule) =>
      typeof rule === 'string' ? rule === origin : rule.test(origin),
    )

    if (isAllowed) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/admin', adminRoutes)
app.use('/api', publicRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: 'Internal server error' })
})

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
