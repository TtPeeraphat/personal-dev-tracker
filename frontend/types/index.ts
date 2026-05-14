export interface Task {
  _id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags: string[]
  goalId?: string
  dueDate?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  _id: string
  title: string
  completed: boolean
  completedAt?: string
  dueDate?: string
}

export interface Goal {
  _id: string
  title: string
  description?: string
  category: 'learning' | 'health' | 'career' | 'finance' | 'relationship' | 'other'
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  targetDate: string
  progress: number
  milestones: Milestone[]
  whyImportant?: string
  reward?: string
  createdAt: string
}

export interface HabitLog {
  date: string
  completed: boolean
  count: number
  note?: string
}

export interface Habit {
  _id: string
  title: string
  description?: string
  icon?: string
  color?: string
  frequency: 'daily' | 'weekly' | 'custom'
  targetDays?: number[]
  targetCount: number
  streak: number
  longestStreak: number
  logs: HabitLog[]
  isActive: boolean
  createdAt: string
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  timezone: string
  preferences: {
    theme: string
    language: string
    weekStartsOn: string
    defaultView: string
  }
}

export interface AuthResponse {
  token: string
  user: User
}

export interface JournalEntry {
  id: number
  date: string
  mood: string
  title: string
  preview: string
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge: string | null;
  badgeRed?: boolean;
}