const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getToken = () => localStorage.getItem("token");

// ── Generic fetch wrapper ──────────────────────────────
const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
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
    throw new Error("Unauthorized");
  }

  if (res.status === 204) return null as T;  // DELETE ไม่มี body

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "เกิดข้อผิดพลาด");
  }

  return res.json();
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

// ── Types (inline เพื่อให้ใช้ได้ทันที) ────────────────
export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  tags: string[];
  goalId?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Milestone {
  _id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  dueDate?: string;
}

export interface Goal {
  _id: string;
  title: string;
  description?: string;
  category: "learning" | "health" | "career" | "finance" | "relationship" | "other";
  status: "active" | "completed" | "paused" | "cancelled";
  priority: "low" | "medium" | "high";
  targetDate: string;
  progress: number;
  milestones: Milestone[];
  whyImportant?: string;
  createdAt: string;
}

export interface HabitLog {
  date: string;
  completed: boolean;
  count: number;
  note?: string;
}

export interface Habit {
  _id: string;
  title: string;
  icon?: string;
  color?: string;
  frequency: "daily" | "weekly" | "custom";
  targetCount: number;
  streak: number;
  longestStreak: number;
  logs: HabitLog[];
  isActive: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}