import type { CSSProperties } from "react";
import type { Task, Goal, Habit, JournalEntry, NavItem } from "@/types";

// ─── Data ─────────────────────────────────────────────────────────────────────

export const INITIAL_TASKS: Task[] = []

export const GOALS: Goal[] = []

export const JOURNAL_ENTRIES: JournalEntry[] = [
  { id: 1, date: "Tue, May 12", mood: "😊 Good", title: "Productive coding session", preview: "Finished auth middleware and wrote most of the CRUD endpoints. The JWT implementation was cleaner than expected. Starting to see the project come together…" },
  { id: 2, date: "Mon, May 11", mood: "🔥 Energized", title: "Goals review day", preview: "Reviewed all four active goals. Running is on track. Reading goal needs more attention this week — fell behind over the weekend…" },
  { id: 3, date: "Sun, May 10", mood: "😐 Neutral", title: "Rest day reflection", preview: "Took a full rest day. Finished Atomic Habits ch.4. The habit stacking idea is exactly what I need to get the coding habit more consistent…" },
];

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const WEEK_VALS = [5, 8, 4, 9, 7, 3, 6];
export const REPORT_VALS = [4, 7, 6, 9, 5, 3, 6];
export const MOODS = ["😊 Good", "🔥 Energized", "😐 Neutral", "😴 Tired", "😞 Rough"];

export const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  work:     { bg: "#E6F1FB", color: "#185FA5" },
  personal: { bg: "#EEEDFE", color: "#3C3489" },
  health:   { bg: "#EAF3DE", color: "#3B6D11" },
  study:    { bg: "#FAEEDA", color: "#854F0B" },
};

export const PRIORITY_COLORS: Record<string, string> = {
  high: "#E24B4A",
  med:  "#EF9F27",
  low:  "#63992280",
};

export const HEATMAP_LEVELS = Array.from({ length: 52 }, () =>
  Math.random() > 0.15 ? Math.floor(Math.random() * 5) : 0
);

export const WEEK_GRID_DATA: Record<string, boolean[]> = {
  Morning:  DAYS.map(() => Math.random() > 0.3),
  Exercise: DAYS.map(() => Math.random() > 0.3),
  Reading:  DAYS.map(() => Math.random() > 0.3),
};

export const NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "⊞", badge: null },
  { id: "tasks",     label: "Tasks",     icon: "✓", badge: null },
  { id: "goals",     label: "Goals",     icon: "◎", badge: null },
  { id: "habits",    label: "Habits",    icon: "⚡", badge: null, badgeRed: true },
  { id: "reports",   label: "Reports",   icon: "▦", badge: null },
  { id: "journal",   label: "Journal",   icon: "📓", badge: null },
  { id: "settings",  label: "Settings",  icon: "⚙", badge: null },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

export const S: Record<string, any> = {
  app: {
    display: "flex", height: "100vh",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: 14, background: "#FAFAF8", color: "#1a1a18", overflow: "hidden",
  } as CSSProperties,

  sidebar: {
    width: 220, background: "#fff",
    borderRight: "0.5px solid rgba(0,0,0,0.08)",
    display: "flex", flexDirection: "column", flexShrink: 0,
  } as CSSProperties,

  logo: { padding: "20px 18px 16px", borderBottom: "0.5px solid rgba(0,0,0,0.08)" } as CSSProperties,
  logoText: { fontFamily: "Georgia, serif", fontSize: 17, fontStyle: "italic", color: "#1a1a18", letterSpacing: "-0.02em" } as CSSProperties,
  logoSub: { fontFamily: "monospace", fontSize: 11, color: "#888780", marginTop: 2 } as CSSProperties,

  navSection: {
    padding: "12px 14px 4px", fontSize: 10, fontWeight: 600,
    color: "#888780", letterSpacing: "0.08em", textTransform: "uppercase",
  } as CSSProperties,

  navItem: (active: boolean): CSSProperties => ({
    display: "flex", alignItems: "center", gap: 9,
    padding: "8px 10px", borderRadius: 7, cursor: "pointer",
    color: active ? "#0F6E56" : "#5F5E5A", fontSize: 13,
    margin: "1px 6px",
    background: active ? "#E1F5EE" : "transparent",
    fontWeight: active ? 500 : 400, transition: "all 0.15s",
  }),

  navBadge: (red: boolean): CSSProperties => ({
    marginLeft: "auto",
    background: red ? "#FCEBEB" : "#E1F5EE",
    color:      red ? "#A32D2D" : "#0F6E56",
    fontSize: 10, fontFamily: "monospace",
    padding: "1px 7px", borderRadius: 20, fontWeight: 600,
  }),

  sideFooter: { marginTop: "auto", padding: "14px 10px", borderTop: "0.5px solid rgba(0,0,0,0.08)" } as CSSProperties,

  avatarCircle: {
    width: 30, height: 30, borderRadius: "50%", background: "#E1F5EE",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 600, color: "#0F6E56", flexShrink: 0,
  } as CSSProperties,

  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" } as CSSProperties,

  topbar: {
    padding: "13px 24px", borderBottom: "0.5px solid rgba(0,0,0,0.08)",
    display: "flex", alignItems: "center", gap: 10,
    background: "#fff", flexShrink: 0,
  } as CSSProperties,

  pageTitle: {
    fontFamily: "Georgia, serif", fontSize: 19,
    fontWeight: 400, fontStyle: "italic", letterSpacing: "-0.02em",
  } as CSSProperties,

  btn: (primary: boolean): CSSProperties => ({
    padding: "6px 14px", borderRadius: 7,
    border: primary ? "none" : "0.5px solid rgba(0,0,0,0.12)",
    background: primary ? "#1D9E75" : "#fff",
    color: primary ? "#fff" : "#5F5E5A",
    fontSize: 12, cursor: "pointer",
    display: "flex", alignItems: "center", gap: 5,
    fontFamily: "inherit",
  }),

  content: { flex: 1, overflowY: "auto", padding: "22px 24px" } as CSSProperties,

  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } as CSSProperties,
  grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 18 } as CSSProperties,

  card: {
    background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)",
    borderRadius: 12, padding: "16px 18px",
  } as CSSProperties,

  cardTitle: {
    fontSize: 11, fontWeight: 600, color: "#888780",
    letterSpacing: "0.04em", textTransform: "uppercase",
    marginBottom: 12, display: "flex", alignItems: "center",
    justifyContent: "space-between",
  } as CSSProperties,

  metric: { background: "#F4F4F0", borderRadius: 9, padding: "14px 16px" } as CSSProperties,
  metricLabel: { fontSize: 11, color: "#888780", marginBottom: 5 } as CSSProperties,
  metricVal: { fontFamily: "monospace", fontSize: 24, fontWeight: 600, color: "#1a1a18", lineHeight: 1 } as CSSProperties,
  metricSub: { fontSize: 11, color: "#888780", marginTop: 4 } as CSSProperties,

  progressBar: { height: 5, background: "#E1F5EE", borderRadius: 3, overflow: "hidden", marginTop: 6 } as CSSProperties,
  progressFill: (pct: number, h?: string | number): CSSProperties => ({
    height: h || "100%", width: `${pct}%`, background: "#1D9E75", borderRadius: 3,
  }),

  tabs: { display: "flex", gap: 2, background: "#F4F4F0", padding: 3, borderRadius: 8, marginBottom: 18 } as CSSProperties,
  tab: (active: boolean): CSSProperties => ({
    padding: "5px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer",
    color: active ? "#1a1a18" : "#5F5E5A",
    background: active ? "#fff" : "transparent",
    fontWeight: active ? 500 : 400,
    border: active ? "0.5px solid rgba(0,0,0,0.08)" : "none",
    transition: "all 0.15s",
  }),

  pill: (active: boolean): CSSProperties => ({
    padding: "4px 12px", borderRadius: 20, fontSize: 11,
    border: `0.5px solid ${active ? "#9FE1CB" : "rgba(0,0,0,0.1)"}`,
    cursor: "pointer",
    color: active ? "#0F6E56" : "#5F5E5A",
    background: active ? "#E1F5EE" : "#fff",
  }),

  tag: (t: string): CSSProperties => ({
    fontSize: 10, fontFamily: "monospace", padding: "2px 8px", borderRadius: 20,
    background: TAG_COLORS[t]?.bg,
    color:      TAG_COLORS[t]?.color,
  }),

  dot: (p: string): CSSProperties => ({
    width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
    background: PRIORITY_COLORS[p],
  }),

  chk: (done: boolean): CSSProperties => ({
    width: 16, height: 16, borderRadius: 4,
    border: done ? "none" : "1.5px solid rgba(0,0,0,0.2)",
    background: done ? "#1D9E75" : "transparent",
    cursor: "pointer", flexShrink: 0,
    display: "flex", alignItems: "center",
    justifyContent: "center",
    color: "#fff", fontSize: 10,
    flexDirection: "row",
  }),

  toggle: (on: boolean): CSSProperties => ({
    width: 34, height: 19,
    background: on ? "#1D9E75" : "#D3D1C7",
    borderRadius: 20, cursor: "pointer",
    position: "relative", transition: "background 0.2s",
    flexShrink: 0, border: "none",
  }),

  toggleKnob: (on: boolean): CSSProperties => ({
    position: "absolute", width: 15, height: 15,
    background: "#fff", borderRadius: "50%",
    top: 2, left: on ? 17 : 2, transition: "left 0.2s",
  }),

  input: {
    padding: "7px 11px", borderRadius: 7,
    border: "0.5px solid rgba(0,0,0,0.12)",
    background: "#fff", fontSize: 13, color: "#1a1a18",
    outline: "none", width: "100%", fontFamily: "inherit",
  } as CSSProperties,

  iconBtn: {
    width: 28, height: 28, borderRadius: 6,
    border: "0.5px solid rgba(0,0,0,0.1)",
    background: "#fff", cursor: "pointer",
    display: "flex", alignItems: "center",
    justifyContent: "center", color: "#888780", fontSize: 14,
  } as CSSProperties,

  moodChip: (sel: boolean): CSSProperties => ({
    padding: "6px 12px", borderRadius: 20,
    border: `0.5px solid ${sel ? "#9FE1CB" : "rgba(0,0,0,0.1)"}`,
    cursor: "pointer", fontSize: 12,
    background: sel ? "#E1F5EE" : "#fff",
    color: sel ? "#0F6E56" : "#5F5E5A",
  }),
};

export const modalOverlay: CSSProperties = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(0,0,0,0.4)", display: "flex",
  alignItems: "center", justifyContent: "center", zIndex: 100,
};

export const modalBox: CSSProperties = {
  background: "#fff", padding: 24, borderRadius: 12,
  width: "100%", maxWidth: 400,
};

export const labelStyle: CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600,
  color: "#888780", marginBottom: 6, textTransform: "uppercase",
};