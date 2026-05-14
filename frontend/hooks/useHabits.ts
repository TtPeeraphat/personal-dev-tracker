'use client'

import { useState, useEffect, useCallback } from 'react'
import { habitsApi } from '@/lib/api'
import { Habit } from '@/types'

export function useHabits() {
  const [habits, setHabits]   = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true)
      const data = await habitsApi.getAll() as Habit[]
      setHabits(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  const createHabit = async (data: Partial<Habit>) => {
    const newHabit = await habitsApi.create(data) as Habit
    setHabits(prev => [newHabit, ...prev])
    return newHabit
  }

  const updateHabit = async (id: string, data: Partial<Habit>) => {
    const updated = await habitsApi.update(id, data) as Habit
    setHabits(prev => prev.map(h => h._id === id ? updated : h))
    return updated
  }

  const deleteHabit = async (id: string) => {
    await habitsApi.delete(id)
    setHabits(prev => prev.filter(h => h._id !== id))
  }

  const logToday = async (id: string, data: { completed: boolean; note?: string }) => {
    const updated = await habitsApi.logToday(id, data) as Habit
    setHabits(prev => prev.map(h => h._id === id ? updated : h))
    return updated
  }

  return { habits, loading, error, createHabit, updateHabit, deleteHabit, logToday, refetch: fetchHabits }
}