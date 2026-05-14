import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import connectDB from './lib/db'
import authRoutes  from './routes/auth'
import taskRoutes  from './routes/tasks'
import goalRoutes  from './routes/goals'    // เพิ่ม
import habitRoutes from './routes/habits'   // เพิ่ม

const app = express()
app.use(cors())
app.use(express.json())

connectDB()

app.use('/api/auth',   authRoutes)
app.use('/api/tasks',  taskRoutes)
app.use('/api/goals',  goalRoutes)    // เพิ่ม
app.use('/api/habits', habitRoutes)   // เพิ่ม

app.get('/health', (_, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))