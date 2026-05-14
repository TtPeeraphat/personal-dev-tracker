import { useState, useEffect } from "react";
import { goalsApi, Goal } from "@/lib/api";
import { S, modalOverlay, modalBox, labelStyle } from "@/constants/styles";
import { Tabs } from "@/components/ui/Tabs";

export function Goals() {
  const [goals, setGoals]     = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Active Goals");
  const [showModal, setShowModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title:      "",
    category:   "other" as Goal["category"],
    priority:   "medium" as Goal["priority"],
    targetDate: "",
  });

  const tabs = ["Active Goals", "Milestones", "Completed"];

  // ── ดึงข้อมูล ─────────────────────────────────────
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const data = await goalsApi.getAll();
        setGoals(data);
      } catch (err: any) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  // ── Actions ───────────────────────────────────────
  const handleCreate = async () => {
    if (!newGoal.title.trim() || !newGoal.targetDate) return;
    try {
      const created = await goalsApi.create(newGoal);
      setGoals(prev => [created, ...prev]);
      setShowModal(false);
      setNewGoal({ title: "", category: "other", priority: "medium", targetDate: "" });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบ goal นี้?")) return;
    try {
      await goalsApi.delete(id);
      setGoals(prev => prev.filter(g => g._id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleMilestone = async (goalId: string, milestoneId: string) => {
    try {
      const updated = await goalsApi.toggleMilestone(goalId, milestoneId);
      setGoals(prev => prev.map(g => g._id === goalId ? updated : g));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddMilestone = async (goalId: string, title: string) => {
    if (!title.trim()) return;
    try {
      const updated = await goalsApi.addMilestone(goalId, { title });
      setGoals(prev => prev.map(g => g._id === goalId ? updated : g));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{ padding: 32, color: "#888780" }}>กำลังโหลด...</div>;

  const displayed = goals.filter(g =>
    activeTab === "Completed" ? g.status === "completed" : g.status === "active"
  );

  return (
    <div>
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button style={S.btn(true)} onClick={() => setShowModal(true)}>+ New Goal</button>
      </div>

      <div style={S.grid2}>
        <div>
          {displayed.filter((_, i) => i % 2 === 0).map(g => (
            <GoalCard
              key={g._id}
              goal={g}
              onDelete={handleDelete}
              onToggleMilestone={handleToggleMilestone}
              onAddMilestone={handleAddMilestone}
            />
          ))}
        </div>
        <div>
          {displayed.filter((_, i) => i % 2 === 1).map(g => (
            <GoalCard
              key={g._id}
              goal={g}
              onDelete={handleDelete}
              onToggleMilestone={handleToggleMilestone}
              onAddMilestone={handleAddMilestone}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>สร้าง Goal ใหม่</div>

            <label style={labelStyle}>ชื่อ Goal</label>
            <input
              style={{ ...S.input, marginBottom: 12 }}
              placeholder="เช่น เรียน TypeScript ให้เก่งภายใน 3 เดือน"
              value={newGoal.title}
              onChange={e => setNewGoal(p => ({ ...p, title: e.target.value }))}
            />

            <label style={labelStyle}>หมวดหมู่</label>
            <select
              style={{ ...S.input, marginBottom: 12 }}
              value={newGoal.category}
              onChange={e => setNewGoal(p => ({ ...p, category: e.target.value as Goal["category"] }))}
            >
              <option value="learning">Learning</option>
              <option value="health">Health</option>
              <option value="career">Career</option>
              <option value="finance">Finance</option>
              <option value="relationship">Relationship</option>
              <option value="other">Other</option>
            </select>

            <label style={labelStyle}>Priority</label>
            <select
              style={{ ...S.input, marginBottom: 12 }}
              value={newGoal.priority}
              onChange={e => setNewGoal(p => ({ ...p, priority: e.target.value as Goal["priority"] }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <label style={labelStyle}>วันเป้าหมาย</label>
            <input
              style={{ ...S.input, marginBottom: 20 }}
              type="date"
              value={newGoal.targetDate}
              onChange={e => setNewGoal(p => ({ ...p, targetDate: e.target.value }))}
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

// ── GoalCard แบบใหม่รองรับ actions ───────────────────
function GoalCard({
  goal, onDelete, onToggleMilestone, onAddMilestone,
}: {
  goal: Goal;
  onDelete: (id: string) => void;
  onToggleMilestone: (goalId: string, milestoneId: string) => void;
  onAddMilestone: (goalId: string, title: string) => void;
}) {
  const [newMilestone, setNewMilestone] = useState("");

  return (
    <div style={{ ...S.card, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{goal.title}</div>
          <div style={{ fontSize: 11, color: "#888780" }}>
            Due: {new Date(goal.targetDate).toLocaleDateString("th-TH")} · {goal.category}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 600, color: "#1D9E75" }}>
            {goal.progress}%
          </span>
          <button
            style={{ ...S.iconBtn, color: "#E24B4A" }}
            onClick={() => onDelete(goal._id)}
          >🗑</button>
        </div>
      </div>

      <div style={S.progressBar}>
        <div style={S.progressFill(goal.progress, 7)} />
      </div>

      {/* Milestones */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 8, textTransform: "uppercase" }}>
          Milestones
        </div>
        {goal.milestones.map(m => (
          <div
            key={m._id}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0",
              borderBottom: "0.5px solid rgba(0,0,0,0.06)", cursor: "pointer" }}
            onClick={() => onToggleMilestone(goal._id, m._id)}
          >
            <div style={{
              width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
              background: m.completed ? "#1D9E75" : "transparent",
              border: m.completed ? "none" : "2px solid rgba(0,0,0,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 8,
            }}>
              {m.completed && "✓"}
            </div>
            <span style={{
              fontSize: 13,
              textDecoration: m.completed ? "line-through" : "none",
              color: m.completed ? "#888780" : "#1a1a18",
            }}>
              {m.title}
            </span>
          </div>
        ))}

        {/* เพิ่ม Milestone ใหม่ */}
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          <input
            style={{ ...S.input, fontSize: 12 }}
            placeholder="เพิ่ม milestone..."
            value={newMilestone}
            onChange={e => setNewMilestone(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                onAddMilestone(goal._id, newMilestone);
                setNewMilestone("");
              }
            }}
          />
          <button
            style={S.btn(true)}
            onClick={() => { onAddMilestone(goal._id, newMilestone); setNewMilestone(""); }}
          >+</button>
        </div>
      </div>
    </div>
  );
}