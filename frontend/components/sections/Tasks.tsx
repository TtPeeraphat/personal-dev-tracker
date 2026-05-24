// ── Tasks section component ──────────────────────────
import { useState, useEffect } from "react";
import { tasksApi, Task } from "@/lib/api";
import { S, modalOverlay, modalBox, labelStyle } from "@/constants/styles";
import { Tabs } from "@/components/ui/Tabs";

interface TasksProps {
  tasks?: Task[];
  loading?: boolean;
  error?: string | null;
  createTask?: (data: Partial<Task>) => Promise<Task>;
  completeTask?: (id: string) => Promise<void>;
  deleteTask?: (id: string) => Promise<void>;
}

export function Tasks({
  tasks: initialTasks,
  loading: initialLoading,
  error: initialError,
  createTask: createTaskProp,
  completeTask: completeTaskProp,
  deleteTask: deleteTaskProp,
}: TasksProps = {}) {

  const [tasks, setTasks]             = useState<Task[]>(initialTasks || []);
  const [loading, setLoading]         = useState(initialLoading ?? true);
  const [error, setError]             = useState<string | null>(initialError ?? null);
  const [activeTab, setActiveTab]     = useState("All Tasks");
  const [activeFilter, setActiveFilter] = useState("All");

  // Modal สำหรับสร้าง task ใหม่
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask]     = useState({
    title:    "",
    priority: "medium" as Task["priority"],
    dueDate:  "",
    tags:     [] as string[],
  });

  // Listen for Topbar "New Task" trigger
  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.section === "tasks" || customEvent.detail?.section === "dashboard") {
        setShowModal(true);
      }
    };
    window.addEventListener("trigger-create", handleTrigger);
    return () => window.removeEventListener("trigger-create", handleTrigger);
  }, []);

  const tabs    = ["All Tasks", "Today", "Upcoming", "Completed"];
  const filters = ["All", "Work", "Health", "Study"];

  // ── ดึงข้อมูลจาก Backend ──────────────────────────
  useEffect(() => {
    // Skip refetch if data was passed via props
    if (initialTasks && initialTasks.length > 0) {
      setTasks(initialTasks);
      setLoading(initialLoading ?? false);
      return;
    }

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await tasksApi.getAll();
        setTasks(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [initialTasks, initialLoading, initialError]);

  // ── กรองข้อมูล ────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const filtered = tasks
    .filter((t) => {
      if (activeTab === "Today")
        return t.dueDate?.startsWith(today);
      if (activeTab === "Upcoming")
        return t.dueDate?.startsWith(tomorrow) || (!t.dueDate && t.status !== "done");
      if (activeTab === "Completed")
        return t.status === "done";
      return true;
    })
    .filter((t) =>
      activeFilter === "All" ||
      t.tags.includes(activeFilter.toLowerCase())
    );

  // ── Actions ───────────────────────────────────────
  const handleCreate = async () => {
    if (!newTask.title.trim()) return;
    try {
      if (createTaskProp) {
        await createTaskProp(newTask);
      } else {
        const created = await tasksApi.create(newTask);
        setTasks(prev => [created, ...prev]);
      }
      setShowModal(false);
      setNewTask({ title: "", priority: "medium", dueDate: "", tags: [] });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      if (completeTaskProp) {
        await completeTaskProp(id);
      } else {
        const updated = await tasksApi.complete(id);
        setTasks(prev => prev.map(t => t._id === id ? updated : t));
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบ task นี้?")) return;
    try {
      if (deleteTaskProp) {
        await deleteTaskProp(id);
      } else {
        await tasksApi.delete(id);
        setTasks(prev => prev.filter(t => t._id !== id));
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ── Render ────────────────────────────────────────
  if (loading) return <div style={{ padding: 32, color: "#888780" }}>กำลังโหลด...</div>;
  if (error)   return <div style={{ padding: 32, color: "#A32D2D" }}>เกิดข้อผิดพลาด: {error}</div>;

  return (
    <div>
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        {filters.map((f) => (
          <div key={f} style={S.pill(activeFilter === f)} onClick={() => setActiveFilter(f)}>{f}</div>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <button style={S.btn(true)} onClick={() => setShowModal(true)}>+ New Task</button>
        </div>
      </div>

      {/* Task List */}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 32, color: "#888780" }}>ไม่มี task</div>
      )}
      {filtered.map((task) => (
        <div
          key={task._id}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "11px 14px", background: "#fff",
            border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 9,
            marginBottom: 8, opacity: task.status === "done" ? 0.6 : 1,
          }}
        >
          {/* Checkbox */}
          <div
            style={{ ...S.chk(task.status === "done"), width: 20, height: 20, borderRadius: 5 }}
            onClick={() => handleComplete(task._id)}
          >
            {task.status === "done" && "✓"}
          </div>

          {/* Priority dot */}
          <div style={S.dot(task.priority === "urgent" ? "high" : task.priority)} />

          {/* Content */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 13, fontWeight: 500,
              textDecoration: task.status === "done" ? "line-through" : "none"
            }}>
              {task.title}
            </div>
            <div style={{ fontSize: 11, color: "#888780", marginTop: 2 }}>
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString("th-TH") : "ไม่มีกำหนด"}
              {task.tags.map(tag => (
                <span key={tag} style={{ ...S.tag(tag), marginLeft: 6 }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <button
            style={{ ...S.iconBtn, color: "#E24B4A" }}
            onClick={() => handleDelete(task._id)}
          >
            🗑
          </button>
        </div>
      ))}

      {/* Modal สร้าง Task ใหม่ */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>สร้าง Task ใหม่</div>

            <label style={labelStyle}>ชื่อ Task</label>
            <input
              style={{ ...S.input, marginBottom: 12 }}
              placeholder="เช่น เรียน TypeScript 1 ชั่วโมง"
              value={newTask.title}
              onChange={(e) => setNewTask(p => ({ ...p, title: e.target.value }))}
            />

            <label style={labelStyle}>Priority</label>
            <select
              style={{ ...S.input, marginBottom: 12 }}
              value={newTask.priority}
              onChange={(e) => setNewTask(p => ({ ...p, priority: e.target.value as Task["priority"] }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <label style={labelStyle}>วันครบกำหนด</label>
            <input
              style={{ ...S.input, marginBottom: 20 }}
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
            />

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button style={S.btn(false)} onClick={() => setShowModal(false)}>ยกเลิก</button>
              <button style={S.btn(true)} onClick={handleCreate}>สร้าง</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}