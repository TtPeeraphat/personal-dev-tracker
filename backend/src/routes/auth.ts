import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/user'
import { protect, AuthRequest } from '../middleware/authMiddleware'
import { validate } from '../middleware/validate'
import { registerSchema, loginSchema } from '../validators/schemas'
import { logger } from '../lib/logger'

const router = Router()

const generateToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '7d' })

// ── Auto-seed demo user if no regular user exists ────────────────────────────
async function ensureDefaultUser() {
  try {
    const count = await User.countDocuments({ role: 'user' })
    if (count === 0) {
      const demoEmail = 'user@devtrack.local'
      const exists = await User.findOne({ email: demoEmail })
      if (!exists) {
        await User.create({
          email: demoEmail,
          password: 'Password123!',
          firstName: 'Demo',
          lastName: 'User',
          role: 'user',
        })
        logger.info(`Seeded default demo user "${demoEmail}".`)
      }
    }
  } catch (err) {
    logger.error('ensureDefaultUser failed', err)
  }
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body

    const exists = await User.findOne({ email: String(email).toLowerCase() })
    if (exists) {
      res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' })
      return
    }

    const user = await User.create({
      email: String(email).toLowerCase(),
      password,
      firstName,
      lastName,
      role: 'user',
    })
    const token = generateToken(user._id.toString())

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, firstName, lastName, role: user.role }
    })
  } catch (error) {
    logger.error('POST /auth/register', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
})

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const cleanEmail = String(email).toLowerCase().trim()

    await ensureDefaultUser()

    const user = await User.findOne({ email: cleanEmail })
    if (!user) {
      // ตอบ message เดียวกันทั้งกรณี ไม่ให้ enumerate email ได้
      res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
      return
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
      return
    }

    const token = generateToken(user._id.toString())
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      }
    })
  } catch (error) {
    logger.error('POST /auth/login', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
})

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body ?? {}
    if (!email) {
      res.status(400).json({ message: 'กรุณากรอกอีเมล' })
      return
    }

    const cleanEmail = String(email).toLowerCase().trim()
    const user = await User.findOne({ email: cleanEmail })

    // Log request for debugging / audit
    if (user) {
      logger.info(`Password reset requested for: ${cleanEmail}`)
    } else {
      logger.info(`Password reset requested for non-existent email: ${cleanEmail}`)
    }

    res.json({
      message: 'หากอีเมลนี้อยู่ในระบบ เราได้ส่งคำแนะนำการตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณเรียบร้อยแล้ว'
    })
  } catch (error) {
    logger.error('POST /auth/forgot-password', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
})

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    if (!user) {
      res.status(404).json({ message: 'ไม่พบผู้ใช้' })
      return
    }
    res.json(user)
  } catch (error) {
    logger.error('GET /auth/me', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
})

export default router