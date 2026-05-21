import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import connectDB from './lib/db'
import authRoutes  from './routes/auth'
import taskRoutes  from './routes/tasks'
import goalRoutes  from './routes/goals'
import habitRoutes from './routes/habits'

const app = express()

// ✅ แก้ CORS ให้รับจาก Vercel domain จริง
app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL || 'https://your-app.vercel.app'
  ],
  credentials: true,
}))

app.use(express.json())
connectDB()

app.use('/api/auth',   authRoutes)
app.use('/api/tasks',  taskRoutes)
app.use('/api/goals',  goalRoutes)
app.use('/api/habits', habitRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))