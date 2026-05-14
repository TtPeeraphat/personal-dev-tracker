import { Router, Response } from 'express'
import { Goal } from '../models/Goal'
import { protect, AuthRequest } from '../middleware/authMiddleware'

const router = Router()
router.use(protect)  // ทุก route ต้อง login

// ── GET /api/goals ─────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, category } = req.query
    const filter: any = { userId: req.userId }
    if (status)   filter.status = status
    if (category) filter.category = category

    const goals = await Goal.find(filter).sort({ createdAt: -1 })
    res.json(goals)
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ── GET /api/goals/:id ─────────────────────────────────
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId } as any)
    if (!goal) return res.status(404).json({ message: 'ไม่พบ goal' })
    res.json(goal)
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ── POST /api/goals ────────────────────────────────────
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const goal = await Goal.create({ ...req.body, userId: req.userId })
    res.status(201).json(goal)
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ── PATCH /api/goals/:id ───────────────────────────────
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId } as any,
      req.body,
      { new: true }
    )
    if (!goal) return res.status(404).json({ message: 'ไม่พบ goal' })
    res.json(goal)
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ── DELETE /api/goals/:id ──────────────────────────────
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId } as any)
    if (!goal) return res.status(404).json({ message: 'ไม่พบ goal' })
    res.status(204).send()
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ── POST /api/goals/:id/milestones ─────────────────────
router.post('/:id/milestones', async (req: AuthRequest, res: Response) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId } as any)
    if (!goal) return res.status(404).json({ message: 'ไม่พบ goal' })

    goal.milestones.push(req.body)
    await goal.save()   // pre-save hook คำนวณ progress ให้อัตโนมัติ
    res.status(201).json(goal)
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ── PATCH /api/goals/:id/milestones/:mId ──────────────
// toggle completed ของ milestone
router.patch('/:id/milestones/:mId', async (req: AuthRequest, res: Response) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId } as any)
    if (!goal) return res.status(404).json({ message: 'ไม่พบ goal' })

    const milestone = (goal.milestones as any).id(req.params.mId)
    if (!milestone) return res.status(404).json({ message: 'ไม่พบ milestone' })

    // toggle
    milestone.completed  = !milestone.completed
    milestone.completedAt = milestone.completed ? new Date() : undefined

    await goal.save()   // pre-save hook คำนวณ progress ใหม่อัตโนมัติ
    res.json(goal)
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ── DELETE /api/goals/:id/milestones/:mId ─────────────
router.delete('/:id/milestones/:mId', async (req: AuthRequest, res: Response) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId } as any)
    if (!goal) return res.status(404).json({ message: 'ไม่พบ goal' })

    goal.milestones = goal.milestones.filter(
      m => m._id.toString() !== req.params.mId
    )
    await goal.save()
    res.json(goal)
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

export default router