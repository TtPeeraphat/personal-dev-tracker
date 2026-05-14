"use client";

import { useState } from "react";
import { S, REPORT_VALS } from "@/constants/styles";
import { Tabs } from "@/components/ui/Tabs";
import { MiniChart } from "@/components/ui/MiniChart";

const CATS = [
  { label: "Work",     pct: 45, color: "#185FA5" },
  { label: "Study",    pct: 25, color: "#534AB7" },
  { label: "Health",   pct: 20, color: "#1D9E75" },
  { label: "Personal", pct: 10, color: "#854F0B" },
];

const WEEKLY_STATS = [
  ["Top habit completed", "Reading"],
  ["Most productive day", "Tuesday"],
  ["Tasks added", "41"],
  ["Tasks completed", "34"],
  ["Completion rate", "83%"],
  ["Longest focus block", "3h 20m"],
];

export function Reports() {
  const [activeTab, setActiveTab] = useState("Weekly Summary");
  const tabs = ["Weekly Summary", "Monthly Overview", "Progress Charts"];

  return (
    <div>
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div style={S.grid4}>
        <div style={S.metric}>
          <div style={S.metricLabel}>Tasks Completed</div>
          <div style={S.metricVal}>34</div>
          <div style={S.metricSub}><span style={{ color: "#1D9E75" }}>↑ 12%</span> vs last week</div>
        </div>
        <div style={S.metric}>
          <div style={S.metricLabel}>Habit Rate</div>
          <div style={S.metricVal}>87<span style={{ fontSize: 14, color: "#888780" }}>%</span></div>
          <div style={S.metricSub}><span style={{ color: "#1D9E75" }}>↑ 5%</span> vs last week</div>
        </div>
        <div style={S.metric}>
          <div style={S.metricLabel}>Focus Hours</div>
          <div style={S.metricVal}>28</div>
          <div style={S.metricSub}>avg 4h/day</div>
        </div>
        <div style={S.metric}>
          <div style={S.metricLabel}>Goal Progress</div>
          <div style={S.metricVal}>+8<span style={{ fontSize: 14, color: "#888780" }}>%</span></div>
          <div style={S.metricSub}>across all goals</div>
        </div>
      </div>

      <div style={{ ...S.grid2, marginBottom: 16 }}>
        <div style={S.card}>
          <div style={S.cardTitle}>Task completion by day</div>
          <MiniChart vals={REPORT_VALS} highlightIdx={3} height={80} />
        </div>
        <div style={S.card}>
          <div style={S.cardTitle}>Category breakdown</div>
          {CATS.map((c) => (
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
          {WEEKLY_STATS.map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)", breakInside: "avoid" }}>
              <span style={{ fontSize: 12, color: "#5F5E5A" }}>{l}</span>
              <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}