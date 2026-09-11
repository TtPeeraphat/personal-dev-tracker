import { Router, Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import jwt from 'jsonwebtoken'
import { User } from '../models/user'
import { Goal } from '../models/Goal'
import { Habit } from '../models/Habit'
import { Task } from '../models/Task'
import { adminProtect, AuthRequest } from '../middleware/authMiddleware'
import { logger } from '../lib/logger'

const router = Router()

// ── Rate limiter: 5 attempts per 15 min per IP ──────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,   // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: true, // Only count failed attempts
})

// ── Helper ──────────────────────────────────────────────────────────────────
const generateAdminToken = (id: string) =>
  jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET as string, { expiresIn: '7d' })

const ADMIN_EMAIL    = (process.env.ADMIN_EMAIL    || 'admin@devtrack.local').toLowerCase()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!'

async function ensureDefaultAdmin(inputEmail: string, inputPass: string) {
  const adminCount = await User.countDocuments({ role: 'admin' })
  if (adminCount === 0) {
    if (inputEmail.toLowerCase() === ADMIN_EMAIL && inputPass === ADMIN_PASSWORD) {
      const existing = await User.findOne({ email: ADMIN_EMAIL })
      if (existing) {
        existing.role = 'admin'
        existing.password = ADMIN_PASSWORD
        await existing.save()
        logger.info(`Promoted existing user "${ADMIN_EMAIL}" to admin on initial login.`)
        return existing
      } else {
        const freshAdmin = await User.create({
          email:     ADMIN_EMAIL,
          password:  ADMIN_PASSWORD,
          firstName: 'System',
          lastName:  'Admin',
          role:      'admin',
        })
        logger.info(`Seeded default admin "${ADMIN_EMAIL}" on initial login.`)
        return freshAdmin
      }
    }
  }
  return null
}

// ── POST /admin/login ────────────────────────────────────────────────────────
router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {}

    if (!email || !password) {
      res.status(400).json({ message: 'อีเมลและรหัสผ่านต้องไม่ว่าง' })
      return
    }

    const cleanEmail = String(email).toLowerCase().trim()
    const cleanPass  = String(password)

    let user = await User.findOne({ email: cleanEmail })
    if (!user || user.role !== 'admin') {
      const seeded = await ensureDefaultAdmin(cleanEmail, cleanPass)
      if (seeded) {
        user = seeded
      }
    }

    if (!user || user.role !== 'admin') {
      res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
      return
    }

    const isMatch = await user.comparePassword(cleanPass)
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
        role: user.role,
      },
    })
  } catch (error) {
    logger.error('POST /admin/login', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
})

// ── GET /admin/me ───────────────────────────────────────────────────────────
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

// ── GET /admin/overview ─────────────────────────────────────────────────────
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
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Task.countDocuments(),
      Goal.countDocuments(),
      Habit.countDocuments(),
      Task.countDocuments({ status: { $in: ['todo', 'in_progress'] } }),
      Goal.countDocuments({ status: 'completed' }),
      Habit.countDocuments({ isActive: true }),
      User.find().sort({ createdAt: -1 }).limit(6).select('firstName lastName email createdAt role'),
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
        adminAccounts: await User.countDocuments({ role: 'admin' }),
      },
      recentUsers: recentUsers.map((user) => ({
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })),
    })
  } catch (error) {
    logger.error('GET /admin/overview', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
})

// ── GET /admin/users ─────────────────────────────────────────────────────────
// Query params: page (default 1), limit (default 20, max 100), search (string)
router.get('/users', adminProtect, async (req: AuthRequest, res: Response) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1)
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20)
    const search = (req.query.search as string || '').trim()

    const filter = search
      ? {
          $or: [
            { email:     { $regex: search, $options: 'i' } },
            { firstName: { $regex: search, $options: 'i' } },
            { lastName:  { $regex: search, $options: 'i' } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ])

    res.json({
      users: users.map((u) => ({
        id: u._id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    logger.error('GET /admin/users', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
})

export default router
