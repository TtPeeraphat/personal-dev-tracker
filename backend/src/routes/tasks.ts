import { Router, Response } from 'express'
import { Task } from '../models/Task'
import { protect, AuthRequest } from '../middleware/authMiddleware'

const router = Router()

// ทุก route ต้อง login ก่อน
router.use(protect)

// GET /api/tasks
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, priority } = req.query
    const filter: any = { userId: req.userId }
    if (status)   filter.status = status
    if (priority) filter.priority = priority

    const tasks = await Task.find(filter).sort({ createdAt: -1 })
    res.json(tasks)
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// POST /api/tasks
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.create({ ...req.body, userId: req.userId })
    res.status(201).json(task)
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// PATCH /api/tasks/:id
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId } as any,
      req.body,
      { new: true }
    )
    if (!task) return res.status(404).json({ message: 'ไม่พบ task' })
    res.json(task)
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// PATCH /api/tasks/:id/complete
router.patch('/:id/complete', async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId } as any,
      { status: 'done', completedAt: new Date() },
      { new: true }
    )
    if (!task) return res.status(404).json({ message: 'ไม่พบ task' })
    res.json(task)
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// DELETE /api/tasks/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId } as any)
    if (!task) return res.status(404).json({ message: 'ไม่พบ task' })
    res.status(204).send()
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

export default router