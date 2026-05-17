"use client";

import { useState, useEffect, useRef } from "react";
import { S, modalOverlay, modalBox } from "@/constants/styles";
import { useTasks } from "@/hooks/useTasks";
import { useHabits } from "@/hooks/useHabits";
import { useGoals } from "@/hooks/useGoals";
import type { Task, Habit, Goal } from "@/types";

interface TopbarProps {
  section: string;
  setSection: (s: string) => void;
}

const TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  tasks:     "Tasks",
  goals:     "Goals",
  habits:    "Habits",
  reports:   "Reports & Stats",
  journal:   "Journal",
  settings:  "Settings",
};

const ACTION_LABELS: Record<string, string | null> = {
  dashboard: "Add Task",
  tasks:     "New Task",
  goals:     "New Goal",
  habits:    "New Habit",
  reports:   "Export",
  journal:   "New Entry",
  settings:  null,
};

export function Topbar({ section, setSection }: TopbarProps) {
  const actionLabel = ACTION_LABELS[section];

  // Live Hooks for Search & Notifications
  const { tasks } = useTasks();
  const { habits } = useHabits();
  const { goals } = useGoals();

  // Search States
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Notification States
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifSettings, setNotifSettings] = useState({ daily: true, habit: true, goal: true, weekly: false });
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Date representation
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    // Generate beautiful dynamic date string
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    setFormattedDate(new Date().toLocaleDateString('en-US', options));

    // Load Notification settings
    const stored = localStorage.getItem("devtrack_notifications");
    if (stored) {
      try {
        setNotifSettings(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing notification settings", e);
      }
    }

    // Set up window listener for settings update to sync notifications in real-time
    const handleSettingsUpdate = () => {
      const updated = localStorage.getItem("devtrack_notifications");
      if (updated) {
        try {
          setNotifSettings(JSON.parse(updated));
        } catch {}
      }
    };
    window.addEventListener("settings-updated", handleSettingsUpdate);
    return () => window.removeEventListener("settings-updated", handleSettingsUpdate);
  }, []);

  // Click outside to close notifications dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute Live Notifications/Alerts
  const alerts: Array<{ id: string; type: string; title: string; message: string; section: string }> = [];
  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Daily tasks alert (Pending tasks due today or overdue)
  if (notifSettings.daily) {
    const pendingTodayOrOverdue = tasks.filter(t => {
      if (t.status === "done" || !t.dueDate) return false;
      const dueStr = t.dueDate.split("T")[0];
      return dueStr <= todayStr;
    });

    if (pendingTodayOrOverdue.length > 0) {
      alerts.push({
        id: "daily-tasks",
        type: "daily",
        title: "Daily Tasks",
        message: `You have ${pendingTodayOrOverdue.length} pending task(s) due today or overdue!`,
        section: "tasks",
      });
    }
  }

  // 2. Habit check-in alert (Active habits not completed today)
  if (notifSettings.habit) {
    const uncompletedHabits = habits.filter(h => {
      if (h.isActive === false) return false;
      const isDoneToday = h.logs.some(l => l.date === todayStr && l.completed);
      return !isDoneToday;
    });

    uncompletedHabits.forEach(h => {
      alerts.push({
        id: `habit-${h._id}`,
        type: "habit",
        title: "Habit Reminder",
        message: `Don't forget to log your "${h.title}" habit today!`,
        section: "habits",
      });
    });
  }

  // 3. Goal deadline alert (Goals due within 3 days)
  if (notifSettings.goal) {
    const activeGoals = goals.filter(g => g.status === "active");
    activeGoals.forEach(g => {
      if (g.targetDate) {
        const diffTime = new Date(g.targetDate).getTime() - new Date().getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 3) {
          alerts.push({
            id: `goal-${g._id}`,
            type: "goal",
            title: "Goal Deadline Near",
            message: `Goal "${g.title}" is due in ${diffDays} day(s) (${new Date(g.targetDate).toLocaleDateString("th-TH")})!`,
            section: "goals",
          });
        }
      }
    });
  }

  // Trigger decoupled creation modals
  const handleActionClick = () => {
    if (section === "reports") {
      // For reports, we can trigger report export custom event
      window.dispatchEvent(new CustomEvent("trigger-export"));
    } else {
      // Dispatches general create event for specific sections
      window.dispatchEvent(new CustomEvent("trigger-create", { detail: { section } }));
    }
  };

  // Perform search across Tasks, Goals, and Habits
  const filteredTasks = searchQuery.trim()
    ? tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    : [];

  const filteredGoals = searchQuery.trim()
    ? goals.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const filteredHabits = searchQuery.trim()
    ? habits.filter(h => h.title.toLowerCase().includes(searchQuery.toLowerCase()) || h.frequency.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const hasSearchResults = filteredTasks.length > 0 || filteredGoals.length > 0 || filteredHabits.length > 0;

  return (
    <div style={S.topbar}>
      <div style={S.pageTitle}>{TITLES[section]}</div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center", position: "relative" }}>
        
        {/* Search Button */}
        <button style={S.btn(false)} onClick={() => { setShowSearch(true); setSearchQuery(""); }}>
          🔍 Search
        </button>

        {/* Notifications Icon Button */}
        <div style={{ position: "relative" }}>
          <button style={S.btn(false)} onClick={() => setShowNotifications(!showNotifications)}>
            🔔
            {alerts.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  background: "#E24B4A",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: "bold",
                  borderRadius: "50%",
                  width: 16,
                  height: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 0 2px #fff",
                }}
              >
                {alerts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div
              ref={notifDropdownRef}
              style={{
                position: "absolute",
                top: 40,
                right: 0,
                background: "#fff",
                border: "0.5px solid rgba(0,0,0,0.12)",
                borderRadius: 12,
                width: 320,
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                zIndex: 150,
                padding: "12px 14px",
                maxHeight: 400,
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#888780",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "0.5px solid rgba(0,0,0,0.06)",
                  paddingBottom: 6,
                }}
              >
                <span>Alerts & Notifications</span>
                <span style={{ fontSize: 10, color: "#1D9E75", textTransform: "none", cursor: "pointer" }} onClick={() => { setSection("settings"); setShowNotifications(false); }}>
                  Configure ⚙
                </span>
              </div>

              {alerts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 8px", color: "#888780", fontSize: 13 }}>
                  🎉 You're all caught up! No notifications.
                </div>
              ) : (
                alerts.map(a => (
                  <div
                    key={a.id}
                    onClick={() => {
                      setSection(a.section);
                      setShowNotifications(false);
                    }}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      marginBottom: 6,
                      background: a.type === "goal" ? "#FDF8F0" : a.type === "habit" ? "#F2F9F6" : "#FDF5F5",
                      borderLeft: `3px solid ${a.type === "goal" ? "#EF9F27" : a.type === "habit" ? "#1D9E75" : "#E24B4A"}`,
                      cursor: "pointer",
                      transition: "transform 0.15s",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a18", display: "flex", justifyContent: "space-between" }}>
                      <span>{a.title}</span>
                      <span style={{ fontSize: 10, color: "#888780" }}>→</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#5F5E5A", marginTop: 2, lineHeight: 1.4 }}>
                      {a.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Dynamic Action Button */}
        {actionLabel && (
          <button style={S.btn(true)} onClick={handleActionClick}>
            + {actionLabel}
          </button>
        )}

        {/* Today's Date Display */}
        <span style={{ fontFamily: "monospace", fontSize: 12, color: "#888780", marginLeft: 4 }}>
          {formattedDate || "dev·track"}
        </span>
      </div>

      {/* Global Search Modal */}
      {showSearch && (
        <div style={modalOverlay} onClick={() => setShowSearch(false)}>
          <div
            style={{
              ...modalBox,
              maxWidth: 550,
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              maxHeight: "80vh",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.04)",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input Header */}
            <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 18, marginRight: 10 }}>🔍</span>
              <input
                autoFocus
                style={{
                  border: "none",
                  outline: "none",
                  fontSize: 16,
                  flex: 1,
                  fontFamily: "inherit",
                }}
                placeholder="Search tasks, goals, habits by title, tags..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 16,
                  color: "#888780",
                }}
                onClick={() => setShowSearch(false)}
              >
                ✕
              </button>
            </div>

            {/* Search Results Content */}
            <div style={{ flex: 1, overflowY: "auto", minHeight: 180 }}>
              {!searchQuery.trim() ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 180, color: "#888780" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                  <div style={{ fontSize: 13 }}>Type something to search...</div>
                </div>
              ) : !hasSearchResults ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 180, color: "#888780" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🧐</div>
                  <div style={{ fontSize: 13 }}>No results matching "{searchQuery}"</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  
                  {/* Matching Tasks */}
                  {filteredTasks.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#888780", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                        Tasks ({filteredTasks.length})
                      </div>
                      {filteredTasks.map(t => (
                        <div
                          key={t._id}
                          onClick={() => {
                            setSection("tasks");
                            setShowSearch(false);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 10px",
                            borderRadius: 8,
                            cursor: "pointer",
                            border: "0.5px solid rgba(0,0,0,0.04)",
                            marginBottom: 4,
                            background: "#FCFCFA",
                          }}
                        >
                          <div style={S.chk(t.status === "done")} />
                          <span style={{ fontSize: 13, flex: 1, textDecoration: t.status === "done" ? "line-through" : "none", color: t.status === "done" ? "#888780" : "#1a1a18" }}>
                            {t.title}
                          </span>
                          {t.tags.map(tag => (
                            <span key={tag} style={S.tag(tag)}>{tag}</span>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matching Goals */}
                  {filteredGoals.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#888780", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                        Goals ({filteredGoals.length})
                      </div>
                      {filteredGoals.map(g => (
                        <div
                          key={g._id}
                          onClick={() => {
                            setSection("goals");
                            setShowSearch(false);
                          }}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 8,
                            cursor: "pointer",
                            border: "0.5px solid rgba(0,0,0,0.04)",
                            marginBottom: 4,
                            background: "#FCFCFA",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>🎯 {g.title}</span>
                            <span style={{ fontFamily: "monospace", fontSize: 12, color: "#1D9E75", fontWeight: 600 }}>{g.progress}%</span>
                          </div>
                          <div style={S.progressBar}>
                            <div style={S.progressFill(g.progress)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matching Habits */}
                  {filteredHabits.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#888780", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                        Habits ({filteredHabits.length})
                      </div>
                      {filteredHabits.map(h => (
                        <div
                          key={h._id}
                          onClick={() => {
                            setSection("habits");
                            setShowSearch(false);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 10px",
                            borderRadius: 8,
                            cursor: "pointer",
                            border: "0.5px solid rgba(0,0,0,0.04)",
                            marginBottom: 4,
                            background: "#FCFCFA",
                          }}
                        >
                          <span style={{ fontSize: 16 }}>{h.icon || "⚡"}</span>
                          <span style={{ fontSize: 13, flex: 1, fontWeight: 500 }}>{h.title}</span>
                          <span style={{ fontSize: 11, color: "#888780" }}>{h.frequency}</span>
                          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#1D9E75" }}>🔥 {h.streak}d</span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 10, marginTop: 14 }}>
              <button style={S.btn(false)} onClick={() => setShowSearch(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}