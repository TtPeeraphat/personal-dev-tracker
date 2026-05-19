import type { Task, Goal, Habit, User } from "@/types";

export type { Task, Goal, Habit, User };

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getToken = () => localStorage.getItem("token");

// ── Error class ที่รองรับ field-level errors จาก zod ──────
export class ApiError extends Error {
  fieldErrors?: { field: string; message: string }[];
  status: number;

  constructor(message: string, status: number, fieldErrors?: { field: string; message: string }[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// ── Generic fetch wrapper ──────────────────────────────────
const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...(options?.headers ?? {}),
    },
  });

  if (res.status === 401 && !path.includes("/api/auth/login") && !path.includes("/api/auth/register")) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new ApiError("กรุณาเข้าสู่ระบบใหม่", 401);
  }

  if (res.status === 204) return null as T;

  let body: any;
  try {
    body = await res.json();
  } catch {
    throw new ApiError(`HTTP ${res.status}`, res.status);
  }

  if (!res.ok) {
    // ส่ง field errors จาก zod ขึ้นมาด้วย
    throw new ApiError(
      body.message || `HTTP ${res.status}`,
      res.status,
      body.errors
    );
  }

  return body as T;
};

// ── Auth (login / register) ────────────────────────────────
// แยก loginApi ออกมาเพื่อให้ login/page.tsx ใช้ร่วมกัน
// ไม่ต้องประกาศ BASE_URL ซ้ำในแต่ละ page
export const loginApi = {
  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    request<{ token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const authApi = {
  me: () => request<User>("/api/auth/me"),
};

// ── Tasks ──────────────────────────────────────────────────
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

// ── Goals ──────────────────────────────────────────────────
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

// ── Habits ─────────────────────────────────────────────────
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
