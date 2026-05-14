import mongoose, { Schema, Document } from 'mongoose'

export interface IMilestone {
  _id: mongoose.Types.ObjectId
  title: string
  completed: boolean
  completedAt?: Date
  dueDate?: Date
}

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  description?: string
  category: 'learning' | 'health' | 'career' | 'finance' | 'relationship' | 'other'
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  targetDate: Date
  progress: number
  milestones: IMilestone[]
  whyImportant?: string
  reward?: string
}

const milestoneSchema = new Schema<IMilestone>({
  title:       { type: String, required: true },
  completed:   { type: Boolean, default: false },
  completedAt: { type: Date },
  dueDate:     { type: Date },
})

const goalSchema = new Schema<IGoal>({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  description: { type: String },
  category: {
    type: String,
    enum: ['learning', 'health', 'career', 'finance', 'relationship', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  priority:      { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  targetDate:    { type: Date, required: true },
  progress:      { type: Number, default: 0, min: 0, max: 100 },
  milestones:    [milestoneSchema],
  whyImportant:  { type: String },
  reward:        { type: String },
}, { timestamps: true })

// คำนวณ progress อัตโนมัติจาก milestones ก่อน save
goalSchema.pre('save', function () {
  if (this.milestones.length === 0) return
  const done = this.milestones.filter(m => m.completed).length
  this.progress = Math.round((done / this.milestones.length) * 100)
})

export const Goal = mongoose.model<IGoal>('Goal', goalSchema)