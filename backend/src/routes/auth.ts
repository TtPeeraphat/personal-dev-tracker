import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/user'
import { protect, AuthRequest } from '../middleware/authMiddleware'

const router = Router()

const generateToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '7d' })

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' })
    }

    const user = await User.create({ email, password, firstName, lastName })
    const token = generateToken(user._id.toString())

    res.status(201).json({
      token,
      user: { id: user._id, email, firstName, lastName }
    })
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
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
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// GET /api/auth/me  (ต้อง login ก่อน)
router.get('/me', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

export default router