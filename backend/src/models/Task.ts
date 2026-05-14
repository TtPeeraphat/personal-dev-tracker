import mongoose, { Schema, Document } from 'mongoose'

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags: string[]
  goalId?: mongoose.Types.ObjectId
  dueDate?: Date
  completedAt?: Date
}

const taskSchema = new Schema<ITask>({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  description: { type: String },
  status:      { type: String, enum: ['todo','in_progress','done','cancelled'], default: 'todo' },
  priority:    { type: String, enum: ['low','medium','high','urgent'], default: 'medium' },
  tags:        [{ type: String }],
  goalId:      { type: Schema.Types.ObjectId, ref: 'Goal' },
  dueDate:     { type: Date },
  completedAt: { type: Date },
}, { timestamps: true })

export const Task = mongoose.model<ITask>('Task', taskSchema)