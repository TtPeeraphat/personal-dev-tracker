import { Router, Response } from 'express'
import { Goal, IGoal } from '../models/Goal'
import { protect, AuthRequest } from '../middleware/authMiddleware'
import { validate } from '../middleware/validate'
import { createGoalSchema, updateGoalSchema, createMilestoneSchema } from '../validators/schemas'
import { logger } from '../lib/logger'

const router = Router()
router.use(protect)

// GET /api/goals
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, category } = req.query
    const filter: any = { userId: req.userId }
    if (status)   filter.status   = status as string
    if (category) filter.category = category as string

    const goals = await Goal.find(filter).sort({ createdAt: -1 })
    res.json(goals)
  } catch (error) {
    logger.error('GET /goals', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
})

// GET /api/goals/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const goal = await Goal.findOne(
      { _id: req.params.id, userId: req.userId } as any
    )
    if (!goal) { res.status(404).json({ message: 'ไม่พบ goal' }); return }
    res.json(goal)
  } catch (error) {
    logger.error('GET /goals/:id', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
})

// POST /api/goals
router.post('/', validate(createGoalSchema), async (req: AuthRequest, res: Response) => {
  try {
    const goal = await Goal.create({ ...req.body, userId: req.userId })
    res.status(201).json(goal)
  } catch (error) {
    logger.error('POST /goals', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
})

// PATCH /api/goals/:id
router.patch('/:id', validate(updateGoalSchema), async (req: AuthRequest, res: Response) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId } as any,
      req.body,
      { new: true, runValidators: true }
    )
    if (!goal) { res.status(404).json({ message: 'ไม่พบ goal' }); return }
    res.json(goal)
  } catch (error) {
    logger.error('PATCH /goals/:id', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
})

// DELETE /api/goals/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const goal = await Goal.findOneAndDelete(
      { _id: req.params.id, userId: req.userId } as any
    )
    if (!goal) { res.status(404).json({ message: 'ไม่พบ goal' }); return }
    res.status(204).send()
  } catch (error) {
    logger.error('DELETE /goals/:id', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
})

// POST /api/goals/:id/milestones
router.post('/:id/milestones', validate(createMilestoneSchema), async (req: AuthRequest, res: Response) => {
  try {
    const goal = await Goal.findOne(
      { _id: req.params.id, userId: req.userId } as any
    )
    if (!goal) { res.status(404).json({ message: 'ไม่พบ goal' }); return }

    goal.milestones.push(req.body)
    await goal.save()
    res.status(201).json(goal)
  } catch (error) {
    logger.error('POST /goals/:id/milestones', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
})

// PATCH /api/goals/:id/milestones/:mId — toggle completed
router.patch('/:id/milestones/:mId', async (req: AuthRequest, res: Response) => {
  try {
    const goal = await Goal.findOne(
      { _id: req.params.id, userId: req.userId } as any
    )
    if (!goal) { res.status(404).json({ message: 'ไม่พบ goal' }); return }

    const milestone = (goal.milestones as any).id(req.params.mId)
    if (!milestone) { res.status(404).json({ message: 'ไม่พบ milestone' }); return }

    milestone.completed   = !milestone.completed
    milestone.completedAt = milestone.completed ? new Date() : undefined

    await goal.save()
    res.json(goal)
  } catch (error) {
    logger.error('PATCH /goals/:id/milestones/:mId', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
})

// DELETE /api/goals/:id/milestones/:mId
router.delete('/:id/milestones/:mId', async (req: AuthRequest, res: Response) => {
  try {
    const goal = await Goal.findOne(
      { _id: req.params.id, userId: req.userId } as any
    )
    if (!goal) { res.status(404).json({ message: 'ไม่พบ goal' }); return }

    goal.milestones = goal.milestones.filter(
      m => m._id.toString() !== req.params.mId
    )
    await goal.save()
    res.status(204).send()
  } catch (error) {
    logger.error('DELETE /goals/:id/milestones/:mId', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในระบบ' })
  }
})

export default router
