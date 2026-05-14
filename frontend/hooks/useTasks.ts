'use client'

import { useState, useEffect, useCallback } from 'react'
import { tasksApi } from '@/lib/api'
import { Task } from '@/types'

export function useTasks() {
  const [tasks, setTasks]     = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  // ดึงข้อมูลทั้งหมด
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const data = await tasksApi.getAll() as Task[]
      setTasks(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  // สร้างใหม่
  const createTask = async (data: Partial<Task>) => {
    const newTask = await tasksApi.create(data) as Task
    setTasks(prev => [newTask, ...prev])
    return newTask
  }

  // อัปเดต
  const updateTask = async (id: string, data: Partial<Task>) => {
    const updated = await tasksApi.update(id, data) as Task
    setTasks(prev => prev.map(t => t._id === id ? updated : t))
    return updated
  }

  // ลบ
  const deleteTask = async (id: string) => {
    await tasksApi.delete(id)
    setTasks(prev => prev.filter(t => t._id !== id))
  }

  // mark เสร็จ
  const completeTask = async (id: string) => {
    const updated = await tasksApi.complete(id) as Task
    setTasks(prev => prev.map(t => t._id === id ? updated : t))
  }

  return { tasks, loading, error, createTask, updateTask, deleteTask, completeTask, refetch: fetchTasks }
}