'use client'

import { useState, useEffect, useCallback } from 'react'
import { goalsApi } from '@/lib/api'
import { Goal } from '@/types'

interface UseGoalsOptions {
  initialData?: Goal[]
}

export function useGoals(options: UseGoalsOptions = {}) {
  const [goals, setGoals]     = useState<Goal[]>(options.initialData ?? [])
  const [loading, setLoading] = useState(!options.initialData)
  const [error, setError]     = useState<string | null>(null)

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await goalsApi.getAll()
      setGoals(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!options.initialData) fetchGoals()
  }, [fetchGoals, options.initialData])

  const createGoal = async (data: Partial<Goal>) => {
    const newGoal = await goalsApi.create(data)
    setGoals(prev => [newGoal, ...prev])
    return newGoal
  }

  const updateGoal = async (id: string, data: Partial<Goal>) => {
    const updated = await goalsApi.update(id, data)
    setGoals(prev => prev.map(g => g._id === id ? updated : g))
    return updated
  }

  const deleteGoal = async (id: string) => {
    await goalsApi.delete(id)
    setGoals(prev => prev.filter(g => g._id !== id))
  }

  return { goals, loading, error, createGoal, updateGoal, deleteGoal, refetch: fetchGoals }
}
