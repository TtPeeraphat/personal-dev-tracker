'use client'

import { useState, useEffect, useCallback } from 'react'
import { goalsApi } from '@/lib/api'
import { Goal } from '@/types'

export function useGoals() {
  const [goals, setGoals]     = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true)
      const data = await goalsApi.getAll() as Goal[]
      setGoals(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  const createGoal = async (data: Partial<Goal>) => {
    const newGoal = await goalsApi.create(data) as Goal
    setGoals(prev => [newGoal, ...prev])
    return newGoal
  }

  const updateGoal = async (id: string, data: Partial<Goal>) => {
    const updated = await goalsApi.update(id, data) as Goal
    setGoals(prev => prev.map(g => g._id === id ? updated : g))
    return updated
  }

  const deleteGoal = async (id: string) => {
    await goalsApi.delete(id)
    setGoals(prev => prev.filter(g => g._id !== id))
  }

  return { goals, loading, error, createGoal, updateGoal, deleteGoal, refetch: fetchGoals }
}