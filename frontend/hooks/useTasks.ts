'use client'

import { useState, useEffect, useCallback } from 'react'
import { tasksApi } from '@/lib/api'
import { Task } from '@/types'

interface UseTasksOptions {
  /** ถ้า parent ส่ง initialData มาให้ จะไม่ fetch ซ้ำ */
  initialData?: Task[]
}

export function useTasks(options: UseTasksOptions = {}) {
  const [tasks, setTasks]     = useState<Task[]>(options.initialData ?? [])
  const [loading, setLoading] = useState(!options.initialData)
  const [error, setError]     = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await tasksApi.getAll()
      setTasks(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // ถ้าไม่มี initialData → fetch เอง
    if (!options.initialData) fetchTasks()
  }, [fetchTasks, options.initialData])

  const createTask = async (data: Partial<Task>) => {
    const newTask = await tasksApi.create(data)
    setTasks(prev => [newTask, ...prev])
    return newTask
  }

  const updateTask = async (id: string, data: Partial<Task>) => {
    const updated = await tasksApi.update(id, data)
    setTasks(prev => prev.map(t => t._id === id ? updated : t))
    return updated
  }

  const deleteTask = async (id: string) => {
    await tasksApi.delete(id)
    setTasks(prev => prev.filter(t => t._id !== id))
  }

  const completeTask = async (id: string) => {
    const updated = await tasksApi.complete(id)
    setTasks(prev => prev.map(t => t._id === id ? updated : t))
  }

  return { tasks, loading, error, createTask, updateTask, deleteTask, completeTask, refetch: fetchTasks }
}
