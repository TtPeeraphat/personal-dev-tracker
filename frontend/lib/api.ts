// Import canonical types from the single source of truth
import type { Task, Goal, Habit, User } from "@/types";

// Re-export so existing `import { Task } from "@/lib/api"` imports keep working
export type { Task, Goal, Habit, User };

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getToken = () => localStorage.getItem("token");

// ── Generic fetch wrapper ──────────────────────────────
const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Unauthorized - please log in again");
    }

    if (res.status === 204) return null as T;

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status}`;
      try {
        const error = await res.json();
        errorMsg = error.message || errorMsg;
      } catch {
        // Response body might not be JSON
      }
      throw new Error(errorMsg);
    }

    return res.json();
  } catch (err: any) {
    // Network or parse errors
    const message = err.message || "Network error - backend may be unavailable";
    console.error(`API Error [${path}]:`, message);
    throw new Error(message);
  }
};

// ── Tasks ──────────────────────────────────────────────
export const tasksApi = {
  getAll: (query?: string) =>
    request<Task[]>(`/api/tasks${query ? `?${query}` : ""}`),
  create: (data: Partial<Task>) =>
    request<Task>("/api/tasks", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Task>) =>
    request<Task>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  complete: (id: string) =>
    request<Task>(`/api/tasks/${id}/complete`, { method: "PATCH" }),
  delete: (id: string) =>
    request<null>(`/api/tasks/${id}`, { method: "DELETE" }),
};

// ── Goals ──────────────────────────────────────────────
export const goalsApi = {
  getAll: () => request<Goal[]>("/api/goals"),
  create: (data: Partial<Goal>) =>
    request<Goal>("/api/goals", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Goal>) =>
    request<Goal>(`/api/goals/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<null>(`/api/goals/${id}`, { method: "DELETE" }),
  addMilestone: (goalId: string, data: { title: string; dueDate?: string }) =>
    request<Goal>(`/api/goals/${goalId}/milestones`, { method: "POST", body: JSON.stringify(data) }),
  toggleMilestone: (goalId: string, milestoneId: string) =>
    request<Goal>(`/api/goals/${goalId}/milestones/${milestoneId}`, { method: "PATCH" }),
  deleteMilestone: (goalId: string, milestoneId: string) =>
    request<Goal>(`/api/goals/${goalId}/milestones/${milestoneId}`, { method: "DELETE" }),
};

// ── Habits ─────────────────────────────────────────────
export const habitsApi = {
  getAll: () => request<Habit[]>("/api/habits"),
  create: (data: Partial<Habit>) =>
    request<Habit>("/api/habits", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Habit>) =>
    request<Habit>(`/api/habits/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<null>(`/api/habits/${id}`, { method: "DELETE" }),
  logToday: (id: string, data: { completed: boolean; note?: string }) =>
    request<Habit>(`/api/habits/${id}/logs`, { method: "POST", body: JSON.stringify(data) }),
};

// ── Auth ───────────────────────────────────────────────
export const authApi = {
  me: () => request<User>("/api/auth/me"),
};
