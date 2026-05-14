"use client";

import { S } from "@/constants/styles";

interface TopbarProps {
  section: string;
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

export function Topbar({ section }: TopbarProps) {
  const actionLabel = ACTION_LABELS[section];

  return (
    <div style={S.topbar}>
      <div style={S.pageTitle}>{TITLES[section]}</div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
        <button style={S.btn(false)}>🔍 Search</button>
        <button style={S.btn(false)}>🔔</button>
        {actionLabel && (
          <button style={S.btn(true)}>+ {actionLabel}</button>
        )}
        <span style={{ fontFamily: "monospace", fontSize: 12, color: "#888780", marginLeft: 4 }}>
          Wed, May 13
        </span>
      </div>
    </div>
  );
}