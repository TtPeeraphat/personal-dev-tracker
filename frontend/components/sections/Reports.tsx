"use client";

import { useState, useMemo } from "react";
import { S, REPORT_VALS } from "@/constants/styles";
import { Tabs } from "@/components/ui/Tabs";
import { MiniChart } from "@/components/ui/MiniChart";
import { useTasks } from "@/hooks/useTasks";
import { useGoals } from "@/hooks/useGoals";
import { useHabits } from "@/hooks/useHabits";

// Helper: Get date range for calculations
const getDateRange = (days: number) => {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return { start, end };
};

// Helper: Calculate stats from real data
const calculateStats = (tasks: any[], goals: any[], habits: any[]) => {
  const { start: weekStart } = getDateRange(7);
  const { start: monthStart } = getDateRange(30);

  // Tasks completed this week
  const weekTasksCompleted = tasks.filter(t => 
    t.status === 'done' && t.completedAt && new Date(t.completedAt) >= weekStart
  ).length;

  // Tasks added this week
  const weekTasksAdded = tasks.filter(t => new Date(t.createdAt) >= weekStart).length;

  // All tasks completed (total)
  const totalTasksCompleted = tasks.filter(t => t.status === 'done').length;

  // Completion rate
  const completionRate = tasks.length > 0 
    ? Math.round((totalTasksCompleted / tasks.length) * 100) 
    : 0;

  // Habit completion rate
  const today = new Date().toISOString().split('T')[0];
  const habitsTodayCompleted = habits.filter(h => 
    h.logs?.some((l: any) => l.date === today && l.completed)
  ).length;
  const habitRate = habits.length > 0 ? Math.round((habitsTodayCompleted / habits.length) * 100) : 0;

  // Average goal progress
  const avgGoalProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum: number, g: any) => sum + (g.progress || 0), 0) / goals.length) 
    : 0;

  // Category breakdown from tasks
  const categoryCount: Record<string, number> = {};
  tasks.forEach(t => {
    t.tags?.forEach((tag: string) => {
      categoryCount[tag] = (categoryCount[tag] || 0) + 1;
    });
  });

  const totalCategoryTasks = Object.values(categoryCount).reduce((a: number, b: number) => a + b, 0) || 1;
  const cats = Object.entries(categoryCount)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 4)
    .map(([label, count]: any) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      pct: Math.round((count / totalCategoryTasks) * 100),
      color: ["#185FA5", "#534AB7", "#1D9E75", "#854F0B"][Object.keys(categoryCount).indexOf(label)],
    }));

  // Top habit
  const topHabit = habits.length > 0 ? habits[0].title : "N/A";

  return {
    weekTasksCompleted,
    weekTasksAdded,
    completionRate,
    habitRate,
    avgGoalProgress,
    cats: cats.length > 0 ? cats : [
      { label: "No data", pct: 100, color: "#E0E0E0" }
    ],
    topHabit,
  };
};

export function Reports() {
  const [activeTab, setActiveTab] = useState("Weekly Summary");
  const tabs = ["Weekly Summary", "Monthly Overview", "Progress Charts"];
  
  const { tasks, loading: tasksLoading } = useTasks();
  const { goals, loading: goalsLoading } = useGoals();
  const { habits, loading: habitsLoading } = useHabits();

  const stats = useMemo(() => calculateStats(tasks, goals, habits), [tasks, goals, habits]);

  const isLoading = tasksLoading || goalsLoading || habitsLoading;


  return (
    <div>
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {isLoading ? (
        <div style={{ padding: 24, textAlign: "center", color: "#888780" }}>Loading reports...</div>
      ) : (
        <>
          <div style={S.grid4}>
            <div style={S.metric}>
              <div style={S.metricLabel}>Tasks Completed</div>
              <div style={S.metricVal}>{stats.weekTasksCompleted}</div>
              <div style={S.metricSub}>this week</div>
            </div>
            <div style={S.metric}>
              <div style={S.metricLabel}>Habit Rate</div>
              <div style={S.metricVal}>{stats.habitRate}<span style={{ fontSize: 14, color: "#888780" }}>%</span></div>
              <div style={S.metricSub}>today's completion</div>
            </div>
            <div style={S.metric}>
              <div style={S.metricLabel}>Completion Rate</div>
              <div style={S.metricVal}>{stats.completionRate}<span style={{ fontSize: 14, color: "#888780" }}>%</span></div>
              <div style={S.metricSub}>overall</div>
            </div>
            <div style={S.metric}>
              <div style={S.metricLabel}>Goal Progress</div>
              <div style={S.metricVal}>{stats.avgGoalProgress}<span style={{ fontSize: 14, color: "#888780" }}>%</span></div>
              <div style={S.metricSub}>avg all goals</div>
            </div>
          </div>

          <div style={{ ...S.grid2, marginBottom: 16 }}>
            <div style={S.card}>
              <div style={S.cardTitle}>Task completion by day</div>
              <MiniChart vals={REPORT_VALS} highlightIdx={3} height={80} />
            </div>
            <div style={S.card}>
              <div style={S.cardTitle}>Category breakdown</div>
              {stats.cats.map((c) => (
                <div key={c.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span>{c.label}</span>
                    <span style={{ fontFamily: "monospace" }}>{c.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: "#F4F4F0", borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${c.pct}%`, background: c.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>Weekly Stats</div>
            <div style={{ columns: 2, columnGap: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)", breakInside: "avoid" }}>
                <span style={{ fontSize: 12, color: "#5F5E5A" }}>Top habit</span>
                <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 500 }}>{stats.topHabit}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)", breakInside: "avoid" }}>
                <span style={{ fontSize: 12, color: "#5F5E5A" }}>Tasks added</span>
                <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 500 }}>{stats.weekTasksAdded}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)", breakInside: "avoid" }}>
                <span style={{ fontSize: 12, color: "#5F5E5A" }}>Tasks completed</span>
                <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 500 }}>{stats.weekTasksCompleted}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)", breakInside: "avoid" }}>
                <span style={{ fontSize: 12, color: "#5F5E5A" }}>Completion rate</span>
                <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 500 }}>{stats.completionRate}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)", breakInside: "avoid" }}>
                <span style={{ fontSize: 12, color: "#5F5E5A" }}>Active habits</span>
                <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 500 }}>{habits.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)", breakInside: "avoid" }}>
                <span style={{ fontSize: 12, color: "#5F5E5A" }}>Active goals</span>
                <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 500 }}>{goals.filter(g => g.status === 'active').length}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}