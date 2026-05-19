import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

/**
 * Middleware factory — รับ Zod schema แล้ว validate req.body
 * ถ้าผ่าน → แทน req.body ด้วย parsed value (ตัด field พิเศษออก)
 * ถ้าไม่ผ่าน → ตอบ 400 พร้อม error messages
 */
export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const errors = (result.error as ZodError).errors.map(e => ({
        field:   e.path.join('.'),
        message: e.message,
      }))
      res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง', errors })
      return
    }

    // แทน req.body ด้วยข้อมูลที่ผ่าน validation แล้ว (ปลอดภัยกว่าการใช้ raw body)
    req.body = result.data
    next()
  }
