import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/user'
import { Goal } from '../models/Goal'
import { Habit } from '../models/Habit'
import { Task } from '../models/Task'
import { adminProtect, AuthRequest } from '../middleware/authMiddleware'
import { logger } from '../lib/logger'

const router = Router()

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@devtrack.local').toLowerCase()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!'

const ensureDefaultAdmin = async () => {
  let admin = await User.findOne({ email: ADMIN_EMAIL })

  if (!admin) {
    admin = await User.create({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      firstName: 'System',
      lastName: 'Admin',
      role: 'admin'
    })
    return admin
  }

  if (admin.role !== 'admin') {
    admin.role = 'admin'
    await admin.save()
  }

  return admin
}

const generateAdminToken = (id: string) =>
  jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET as string, { expiresIn: '7d' })

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {}

    if (!email || !password) {
      res.status(400).json({ message: 'อีเมลและรหัสผ่านต้องไม่ว่าง' })
      return
    }

    await ensureDefaultAdmin()

    const user = await User.findOne({ email: String(email).toLowerCase() })
    if (!user || user.role !== 'admin') {
      res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
      return
    }

    const isMatch = await user.comparePassword(String(password))
    if (!isMatch) {
      res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
      return
    }

    const token = generateAdminToken(user._id.toString())

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    })
  } catch (error) {
    logger.error('POST /admin/login', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
})

router.get('/me', adminProtect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password')

    if (!user) {
      res.status(404).json({ message: 'ไม่พบผู้ใช้' })
      return
    }

    res.json(user)
  } catch (error) {
    logger.error('GET /admin/me', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
})

router.get('/overview', adminProtect, async (_req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalTasks,
      totalGoals,
      totalHabits,
      activeTasks,
      completedGoals,
      activeHabits,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      Task.countDocuments(),
      Goal.countDocuments(),
      Habit.countDocuments(),
      Task.countDocuments({ status: { $in: ['todo', 'in_progress'] } }),
      Goal.countDocuments({ status: 'completed' }),
      Habit.countDocuments({ isActive: true }),
      User.find().sort({ createdAt: -1 }).limit(6).select('firstName lastName email createdAt role')
    ])

    res.json({
      summary: {
        totalUsers,
        totalTasks,
        totalGoals,
        totalHabits,
        activeTasks,
        completedGoals,
        activeHabits,
        adminAccounts: await User.countDocuments({ role: 'admin' })
      },
      recentUsers: recentUsers.map((user) => ({
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }))
    })
  } catch (error) {
    logger.error('GET /admin/overview', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
})

export default router
