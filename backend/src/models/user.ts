import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

// กำหนด Interface สำหรับ TypeScript
export interface IUser extends Document {
  email: string
  password: string
  firstName: string
  lastName: string
  timezone: string
  preferences: {
    theme: string
    language: string
    weekStartsOn: string
    defaultView: string
  }
  comparePassword(inputPassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  timezone:  { type: String, default: 'Asia/Bangkok' },
  preferences: {
    theme:        { type: String, default: 'light' },
    language:     { type: String, default: 'th' },
    weekStartsOn: { type: String, default: 'mon' },
    defaultView:  { type: String, default: 'list' }
  }
}, { timestamps: true })

// ✅ วิธีเขียนที่ถูกสำหรับ Mongoose 8+
userSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = async function (
  inputPassword: string
): Promise<boolean> {
  return bcrypt.compare(inputPassword, this.password)
}

export const User = mongoose.model<IUser>('User', userSchema)