import { Router, Response } from 'express'
import { Habit } from '../models/Habit'
import { protect, AuthRequest } from '../middleware/authMiddleware'

const router = Router()
router.use(protect)

// helper คำนวณ streak จาก logs
const calcStreak = (logs: { date: string; completed: boolean }[]): number => {
  const today = new Date()
  let streak = 0

  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]  // 'YYYY-MM-DD'

    const log = logs.find(l => l.date === dateStr)
    if (log?.completed) {
      streak++
    } else {
      break  // หยุดทันทีที่เจอวันที่ไม่ได้ทำ
    }
  }
  return streak
}

// ── GET /api/habits ────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const habits = await Habit.find({ userId: req.userId, isActive: true } as any)
      .sort({ createdAt: -1 })
    res.json(habits)
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ── GET /api/habits/:id ────────────────────────────────
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.userId } as any)
    if (!habit) return res.status(404).json({ message: 'ไม่พบ habit' })
    res.json(habit)
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ── POST /api/habits ───────────────────────────────────
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const habit = await Habit.create({ ...req.body, userId: req.userId })
    res.status(201).json(habit)
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ── PATCH /api/habits/:id ──────────────────────────────
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId } as any,
      req.body,
      { new: true }
    )
    if (!habit) return res.status(404).json({ message: 'ไม่พบ habit' })
    res.json(habit)
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ── DELETE /api/habits/:id ─────────────────────────────
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    // soft delete — แค่ปิด isActive แทนการลบจริง
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId } as any,
      { isActive: false },
      { new: true }
    )
    if (!habit) return res.status(404).json({ message: 'ไม่พบ habit' })
    res.status(204).send()
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ── POST /api/habits/:id/logs ──────────────────────────
// บันทึกว่าทำ habit วันนี้แล้ว
router.post('/:id/logs', async (req: AuthRequest, res: Response) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.userId } as any)
    if (!habit) return res.status(404).json({ message: 'ไม่พบ habit' })

    const today = new Date().toISOString().split('T')[0]  // 'YYYY-MM-DD'
    const { completed, note } = req.body

    // ถ้ามี log วันนี้แล้ว → อัปเดต, ถ้าไม่มี → เพิ่มใหม่
    const existingIdx = habit.logs.findIndex(l => l.date === today)
    if (existingIdx >= 0) {
      habit.logs[existingIdx]!.completed = completed
      habit.logs[existingIdx]!.note      = note ?? undefined
    } else {
      habit.logs.push({ date: today, completed, count: 1, note } as any)
    }

    // คำนวณ streak ใหม่
    habit.streak = calcStreak(habit.logs)

    // อัปเดต longestStreak ถ้า streak ปัจจุบันสูงกว่า
    if (habit.streak > habit.longestStreak) {
      habit.longestStreak = habit.streak
    }

    await habit.save()
    res.json(habit)
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ── DELETE /api/habits/:id/logs/:date ─────────────────
// ลบ log วันที่กำหนด เช่น '2026-05-14'
router.delete('/:id/logs/:date', async (req: AuthRequest, res: Response) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.userId } as any)
    if (!habit) return res.status(404).json({ message: 'ไม่พบ habit' })

    habit.logs    = habit.logs.filter(l => l.date !== req.params.date)
    habit.streak  = calcStreak(habit.logs)
    await habit.save()
    res.json(habit)
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

export default router