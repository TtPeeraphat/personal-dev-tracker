import { useState, useEffect } from "react";
import { habitsApi, Habit } from "@/lib/api";
import { S, modalOverlay, modalBox, labelStyle } from "@/constants/styles";
import { Tabs } from "@/components/ui/Tabs";

interface HabitsProps {
  habits?: Habit[];
  loading?: boolean;
  error?: string | null;
  createHabit?: (data: Partial<Habit>) => Promise<Habit>;
  deleteHabit?: (id: string) => Promise<void>;
  logToday?: (id: string, data: { completed: boolean; note?: string }) => Promise<Habit>;
  isMobile?: boolean;
}

export function Habits({
  habits: initialHabits,
  loading: initialLoading,
  error: initialError,
  createHabit: createHabitProp,
  deleteHabit: deleteHabitProp,
  logToday: logTodayProp,
  isMobile,
}: HabitsProps = {}) {
  const [habits, setHabits]   = useState<Habit[]>(initialHabits || []);
  const [loading, setLoading] = useState(initialLoading ?? true);
  const [activeTab, setActiveTab] = useState("Today's Habits");
  const [showModal, setShowModal] = useState(false);
  const [newHabit, setNewHabit] = useState({
    title: "", icon: "⚡", color: "#1D9E75", frequency: "daily" as Habit["frequency"],
  });

  // Listen for Topbar "New Habit" trigger
  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.section === "habits") {
        setShowModal(true);
      }
    };
    window.addEventListener("trigger-create", handleTrigger);
    return () => window.removeEventListener("trigger-create", handleTrigger);
  }, []);

  const tabs = ["Today's Habits", "Habit History"];

  // ── ดึงข้อมูล ─────────────────────────────────────
  useEffect(() => {
    if (initialHabits && initialHabits.length > 0) {
      setHabits(initialHabits);
      setLoading(initialLoading ?? false);
      return;
    }
    const fetchHabits = async () => {
      try {
        const data = await habitsApi.getAll();
        setHabits(data);
      } catch (err: any) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHabits();
  }, [initialHabits, initialLoading, initialError]);

  const today = new Date().toISOString().split("T")[0];

  const isTodayDone = (habit: Habit) =>
    habit.logs.some(l => l.date === today && l.completed);

  // ── Actions ───────────────────────────────────────
  const handleToggle = async (habit: Habit) => {
    try {
      if (logTodayProp) {
        const updated = await logTodayProp(habit._id, { completed: !isTodayDone(habit) });
        setHabits(prev => prev.map(h => h._id === habit._id ? updated : h));
      } else {
        const updated = await habitsApi.logToday(habit._id, {
          completed: !isTodayDone(habit),
        });
        setHabits(prev => prev.map(h => h._id === habit._id ? updated : h));
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreate = async () => {
    if (!newHabit.title.trim()) return;
    try {
      if (createHabitProp) {
        await createHabitProp(newHabit);
      } else {
        const created = await habitsApi.create(newHabit);
        setHabits(prev => [created, ...prev]);
      }
      setShowModal(false);
      setNewHabit({ title: "", icon: "⚡", color: "#1D9E75", frequency: "daily" });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบ habit นี้?")) return;
    try {
      if (deleteHabitProp) {
        await deleteHabitProp(id);
      } else {
        await habitsApi.delete(id);
        setHabits(prev => prev.filter(h => h._id !== id));
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{ padding: 32, color: "#888780" }}>กำลังโหลด...</div>;

  return (
    <div>
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button style={S.btn(true)} onClick={() => setShowModal(true)}>+ New Habit</button>
      </div>

      <div style={S.grid2(isMobile)}>
        {/* Checklist วันนี้ */}
        <div style={S.card}>
          <div style={S.cardTitle}>
            Daily Checklist — {new Date().toLocaleDateString("th-TH")}
          </div>
          {habits.length === 0 && (
            <div style={{ color: "#888780", fontSize: 13, padding: "12px 0" }}>
              ยังไม่มี habit กด + New Habit เพื่อเริ่ม
            </div>
          )}
          {habits.map(h => {
            const done = isTodayDone(h);
            return (
              <div
                key={h._id}
                style={{ display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}
              >
                <span style={{ fontSize: 16 }}>{h.icon || "⚡"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{h.title}</div>
                  <div style={{ fontSize: 11, color: "#888780" }}>{h.frequency}</div>
                </div>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#888780" }}>
                  🔥{h.streak}d
                </span>
                {/* Checkbox */}
                <div
                  style={{ ...S.chk(done), width: 24, height: 24, borderRadius: 5, cursor: "pointer" }}
                  onClick={() => handleToggle(h)}
                >
                  {done && "✓"}
                </div>
                {/* Delete */}
                <button
                  style={{ ...S.iconBtn, color: "#E24B4A" }}
                  onClick={() => handleDelete(h._id)}
                >🗑</button>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div style={S.card}>
          <div style={S.cardTitle}>สถิติสัปดาห์นี้</div>
          {habits.slice(0, 5).map(h => {
            const last7 = Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const dateStr = d.toISOString().split("T")[0];
              return h.logs.find(l => l.date === dateStr)?.completed || false;
            });
            return (
              <div key={h._id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: "#5F5E5A", width: 100, overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.title}</span>
                <div style={{ display: "flex", gap: 3 }}>
                  {last7.map((done, i) => (
                    <div
                      key={i}
                      style={{ width: 20, height: 20, borderRadius: 4,
                        background: done ? "#1D9E75" : "#E1F5EE",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 9,
                        color: done ? "#fff" : "#9FE1CB" }}
                    >
                      {done ? "✓" : ["M","T","W","T","F","S","S"][i]}
                    </div>
                  ))}
                </div>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#888780" }}>
                  🔥{h.longestStreak}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>สร้าง Habit ใหม่</div>
            <label style={labelStyle}>ชื่อ Habit</label>
            <input
              style={{ ...S.input, marginBottom: 12 }}
              placeholder="เช่น อ่านหนังสือ 20 หน้า"
              value={newHabit.title}
              onChange={e => setNewHabit(p => ({ ...p, title: e.target.value }))}
            />
            <label style={labelStyle}>Icon (emoji)</label>
            <input
              style={{ ...S.input, marginBottom: 12 }}
              placeholder="⚡"
              value={newHabit.icon}
              onChange={e => setNewHabit(p => ({ ...p, icon: e.target.value }))}
            />
            <label style={labelStyle}>ความถี่</label>
            <select
              style={{ ...S.input, marginBottom: 20 }}
              value={newHabit.frequency}
              onChange={e => setNewHabit(p => ({ ...p, frequency: e.target.value as Habit["frequency"] }))}
            >
              <option value="daily">ทุกวัน</option>
              <option value="weekly">ทุกสัปดาห์</option>
            </select>
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