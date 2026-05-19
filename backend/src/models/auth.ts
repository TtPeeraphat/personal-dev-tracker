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

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body

    const exists = await User.findOne({ email })
    if (exists) {
      res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' })
      return
    }

    const user = await User.create({ email, password, firstName, lastName })
    const token = generateToken(user._id.toString())

    res.status(201).json({
      token,
      user: { id: user._id, email, firstName, lastName }
    })
  } catch (error) {
    logger.error('POST /auth/register', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
})

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
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
        lastName: user.lastName
      }
    })
  } catch (error) {
    logger.error('POST /auth/login', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
})

// GET /api/auth/me
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
