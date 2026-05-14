import mongoose, { Schema, Document } from 'mongoose'

export interface IHabitLog {
  date: string       // 'YYYY-MM-DD'
  completed: boolean
  count: number
  note?: string
}

export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  description?: string
  icon?: string
  color?: string
  frequency: 'daily' | 'weekly' | 'custom'
  targetDays?: number[]
  targetCount: number
  streak: number
  longestStreak: number
  logs: IHabitLog[]
  isActive: boolean
}

const habitLogSchema = new Schema<IHabitLog>({
  date:      { type: String, required: true },
  completed: { type: Boolean, default: false },
  count:     { type: Number, default: 1 },
  note:      { type: String },
}, { _id: false })  // ไม่ต้องมี _id ใน log แต่ละอัน

const habitSchema = new Schema<IHabit>({
  userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title:         { type: String, required: true },
  description:   { type: String },
  icon:          { type: String, default: '⚡' },
  color:         { type: String, default: '#1D9E75' },
  frequency:     { type: String, enum: ['daily', 'weekly', 'custom'], default: 'daily' },
  targetDays:    [{ type: Number }],
  targetCount:   { type: Number, default: 1 },
  streak:        { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  logs:          [habitLogSchema],
  isActive:      { type: Boolean, default: true },
}, { timestamps: true })

export const Habit = mongoose.model<IHabit>('Habit', habitSchema)