import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/user'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string // Role from JWT payload — avoids redundant DB queries
}

// ── Regular user guard ──────────────────────────────────────────────────────
export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string
      role?: string
    }
    req.userId   = decoded.id
    req.userRole = decoded.role
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Session expired. Please sign in again.' })
    }
    return res.status(401).json({ message: 'Invalid token.' })
  }
}

// ── Admin guard ─────────────────────────────────────────────────────────────
// Fast path: checks role claim in JWT payload first.
// Security path: verifies the user still exists in DB (handles deleted accounts).
export const adminProtect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string
      role?: string
    }

    // Fast-path role check from JWT payload (avoids DB hit for non-admins)
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    // Security check: ensure the admin account still exists in DB
    const user = await User.findById(decoded.id).select('_id role').lean()

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    req.userId   = decoded.id
    req.userRole = decoded.role
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Session expired. Please sign in again.' })
    }
    return res.status(401).json({ message: 'Invalid token.' })
  }
}