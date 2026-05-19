import { z } from 'zod'

// ── Auth ────────────────────────────────────────────────────
export const registerSchema = z.object({
  email:     z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password:  z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  firstName: z.string().min(1, 'กรุณากรอกชื่อ').max(50),
  lastName:  z.string().min(1, 'กรุณากรอกนามสกุล').max(50),
})

export const loginSchema = z.object({
  email:    z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
})

// ── Tasks ───────────────────────────────────────────────────
export const createTaskSchema = z.object({
  title:       z.string().min(1, 'กรุณากรอกชื่อ task').max(200),
  description: z.string().max(2000).optional(),
  status:      z.enum(['todo', 'in_progress', 'done', 'cancelled']).optional(),
  priority:    z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  tags:        z.array(z.string().max(50)).max(10).optional(),
  goalId:      z.string().regex(/^[a-f\d]{24}$/i, 'goalId ไม่ถูกต้อง').optional(),
  dueDate:     z.string().refine(val => val === '' || !isNaN(Date.parse(val)), { message: 'รูปแบบวันที่ไม่ถูกต้อง' }).optional(),
})

export const updateTaskSchema = createTaskSchema.partial()

// ── Goals ───────────────────────────────────────────────────
export const createGoalSchema = z.object({
  title:        z.string().min(1, 'กรุณากรอกชื่อ goal').max(200),
  description:  z.string().max(2000).optional(),
  category:     z.enum(['learning', 'health', 'career', 'finance', 'relationship', 'other']).optional(),
  status:       z.enum(['active', 'completed', 'paused', 'cancelled']).optional(),
  priority:     z.enum(['low', 'medium', 'high']).optional(),
  targetDate:   z.string().refine(val => !isNaN(Date.parse(val)), { message: 'รูปแบบวันที่ไม่ถูกต้อง' }),
  whyImportant: z.string().max(1000).optional(),
  reward:       z.string().max(500).optional(),
})

export const updateGoalSchema = createGoalSchema.partial()

export const createMilestoneSchema = z.object({
  title:   z.string().min(1, 'กรุณากรอกชื่อ milestone').max(200),
  dueDate: z.string().refine(val => val === '' || !isNaN(Date.parse(val)), { message: 'รูปแบบวันที่ไม่ถูกต้อง' }).optional(),
})

// ── Habits ──────────────────────────────────────────────────
export const createHabitSchema = z.object({
  title:       z.string().min(1, 'กรุณากรอกชื่อ habit').max(200),
  description: z.string().max(1000).optional(),
  icon:        z.string().max(10).optional(),
  color:       z.string().regex(/^#[0-9a-fA-F]{6}$/, 'รูปแบบสีไม่ถูกต้อง').optional(),
  frequency:   z.enum(['daily', 'weekly', 'custom']).optional(),
  targetDays:  z.array(z.number().int().min(0).max(6)).max(7).optional(),
  targetCount: z.number().int().min(1).max(100).optional(),
})

export const updateHabitSchema = createHabitSchema.partial()

export const logHabitSchema = z.object({
  completed: z.boolean(),
  note:      z.string().max(500).optional(),
})
