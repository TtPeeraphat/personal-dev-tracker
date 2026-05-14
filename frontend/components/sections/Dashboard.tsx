import { S } from "@/constants/styles";
import { Task, Habit, Goal } from "@/lib/api";

export function Dashboard({
  tasks, habits, goals, setSection,
}: {
  tasks:      Task[];
  habits:     Habit[];
  goals:      Goal[];
  setSection: (s: string) => void;
}) {
  const today      = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter(t => t.dueDate?.startsWith(today));
  const doneTasks  = todayTasks.filter(t => t.status === "done").length;
  const avgProgress = goals.length
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0;
  const maxStreak = habits.length
    ? Math.max(...habits.map(h => h.streak))
    : 0;
  const isTodayDone = (h: Habit) =>
    h.logs.some(l => l.date === today && l.completed);

  return (
    <div>
      {/* Metrics */}
      <div style={S.grid4}>
        <div style={S.metric}>
          <div style={S.metricLabel}>Tasks Today</div>
          <div style={S.metricVal}>{todayTasks.length}</div>
          <div style={S.metricSub}>
            <span style={{ color: "#1D9E75" }}>{doneTasks} done</span>
            {" "}· {todayTasks.length - doneTasks} left
          </div>
        </div>
        <div style={S.metric}>
          <div style={S.metricLabel}>Active Goals</div>
          <div style={S.metricVal}>{goals.filter(g => g.status === "active").length}</div>
          <div style={S.metricSub}>
            <span style={{ color: "#1D9E75" }}>↑ {avgProgress}%</span> avg progress
          </div>
        </div>
        <div style={S.metric}>
          <div style={S.metricLabel}>Habit Streak</div>
          <div style={S.metricVal}>
            {maxStreak}<span style={{ fontSize: 14, color: "#888780" }}>d</span>
          </div>
          <div style={S.metricSub}>
            <span style={{ color: "#1D9E75" }}>🔥 longest streak</span>
          </div>
        </div>
        <div style={S.metric}>
          <div style={S.metricLabel}>Habits Today</div>
          <div style={S.metricVal}>
            {habits.filter(h => isTodayDone(h)).length}
            <span style={{ fontSize: 14, color: "#888780" }}>/{habits.length}</span>
          </div>
          <div style={S.metricSub}>ทำแล้ววันนี้</div>
        </div>
      </div>

      <div style={{ ...S.grid2, marginBottom: 16 }}>
        {/* Today's Tasks */}
        <div style={S.card}>
          <div style={S.cardTitle}>
            Today's Tasks
            <span
              style={{ fontSize: 11, color: "#1D9E75", cursor: "pointer",
                textTransform: "none", letterSpacing: 0, fontWeight: 400 }}
              onClick={() => setSection("tasks")}
            >View all →</span>
          </div>
          {todayTasks.length === 0 && (
            <div style={{ color: "#888780", fontSize: 13, padding: "8px 0" }}>
              ไม่มี task วันนี้
            </div>
          )}
          {todayTasks.slice(0, 5).map(task => (
            <div key={task._id} style={{ display: "flex", alignItems: "center",
              gap: 10, padding: "8px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
              <div style={S.dot(task.priority === "urgent" ? "high" : task.priority)} />
              <span style={{ fontSize: 13, flex: 1,
                textDecoration: task.status === "done" ? "line-through" : "none",
                color: task.status === "done" ? "#888780" : "#1a1a18" }}>
                {task.title}
              </span>
              {task.tags[0] && <span style={S.tag(task.tags[0])}>{task.tags[0]}</span>}
            </div>
          ))}
        </div>

        {/* Goal Progress */}
        <div style={S.card}>
          <div style={S.cardTitle}>
            Goal Progress
            <span
              style={{ fontSize: 11, color: "#1D9E75", cursor: "pointer",
                textTransform: "none", letterSpacing: 0, fontWeight: 400 }}
              onClick={() => setSection("goals")}
            >View all →</span>
          </div>
          {goals.length === 0 && (
            <div style={{ color: "#888780", fontSize: 13, padding: "8px 0" }}>
              ยังไม่มี goal
            </div>
          )}
          {goals.slice(0, 4).map(g => (
            <div key={g._id} style={{ padding: "10px 0",
              borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{g.title}</span>
                <span style={{ fontFamily: "monospace", fontSize: 12, color: "#1D9E75" }}>
                  {g.progress}%
                </span>
              </div>
              <div style={S.progressBar}>
                <div style={S.progressFill(g.progress)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Habits */}
      <div style={S.card}>
        <div style={S.cardTitle}>
          Today's Habits
          <span
            style={{ fontSize: 11, color: "#1D9E75", cursor: "pointer",
              textTransform: "none", letterSpacing: 0, fontWeight: 400 }}
            onClick={() => setSection("habits")}
          >View all →</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {habits.map(h => {
            const done = isTodayDone(h);
            return (
              <div key={h._id} style={{ display: "flex", alignItems: "center",
                gap: 8, padding: "10px 12px", borderRadius: 8,
                background: done ? "#E1F5EE" : "#F4F4F0" }}>
                <span style={{ fontSize: 16 }}>{h.icon || "⚡"}</span>
                <span style={{ fontSize: 12, flex: 1 }}>{h.title}</span>
                <span style={{ fontSize: 10, color: done ? "#1D9E75" : "#888780" }}>
                  {done ? "✓" : `🔥${h.streak}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}