"use client";

import { useState } from "react";
import { S } from "@/constants/styles";
import { Toggle } from "@/components/ui/Toggle";

const NOTIFICATION_ITEMS = [
  { k: "daily",  label: "Daily reminder",       desc: "Remind me to check my tasks each morning" },
  { k: "habit",  label: "Habit check-in",        desc: "Evening nudge to log habits" },
  { k: "goal",   label: "Goal deadline alerts",  desc: "Notify 3 days before a goal is due" },
  { k: "weekly", label: "Weekly report email",   desc: "Send weekly summary every Sunday" },
];

const PREFERENCE_ITEMS = [
  { k: "dark",         label: "Dark mode",                  desc: "Use dark theme" },
  { k: "compact",      label: "Compact view",               desc: "Show more items with less padding" },
  { k: "mondayStart",  label: "Week starts on Monday",      desc: "Calendar and reports use Mon–Sun" },
  { k: "showDone",     label: "Show completed tasks",       desc: "Display completed items in task list" },
];

export function Settings() {
  const [notifs, setNotifs] = useState<Record<string, boolean>>({ daily: true, habit: true, goal: true, weekly: false });
  const [prefs,  setPrefs]  = useState<Record<string, boolean>>({ dark: false, compact: false, mondayStart: true, showDone: true });

  const toggleNotif = (k: string) => setNotifs((p) => ({ ...p, [k]: !p[k] }));
  const togglePref  = (k: string) => setPrefs((p)  => ({ ...p, [k]: !p[k] }));

  return (
    <div style={S.grid2}>
      <div>
        <div style={{ ...S.card, marginBottom: 14 }}>
          <div style={S.cardTitle}>Profile</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ ...S.avatarCircle, width: 48, height: 48, fontSize: 15 }}>AP</div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Anya Petrova</div>
              <div style={{ fontSize: 12, color: "#888780" }}>anya@example.com</div>
            </div>
            <button style={{ ...S.btn(false), marginLeft: "auto", fontSize: 11 }}>Edit photo</button>
          </div>
          {[["Display name", "Anya Petrova"], ["Email", "anya@example.com"], ["Timezone", "Asia/Bangkok (UTC+7)"]].map(([label, val]) => (
            <div key={label} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#888780", marginBottom: 4 }}>{label}</div>
              <input style={S.input} defaultValue={val} />
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
            <button style={S.btn(true)}>Save changes</button>
          </div>
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>Notifications</div>
          {NOTIFICATION_ITEMS.map(({ k, label, desc }) => (
            <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
              <div>
                <div style={{ fontSize: 13 }}>{label}</div>
                <div style={{ fontSize: 11, color: "#888780", marginTop: 2 }}>{desc}</div>
              </div>
              <Toggle on={notifs[k]} onToggle={() => toggleNotif(k)} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ ...S.card, marginBottom: 14 }}>
          <div style={S.cardTitle}>Preferences</div>
          {PREFERENCE_ITEMS.map(({ k, label, desc }) => (
            <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
              <div>
                <div style={{ fontSize: 13 }}>{label}</div>
                <div style={{ fontSize: 11, color: "#888780", marginTop: 2 }}>{desc}</div>
              </div>
              <Toggle on={prefs[k]} onToggle={() => togglePref(k)} />
            </div>
          ))}
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>Account & Data</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button style={{ ...S.btn(false), width: "100%", justifyContent: "center" }}>⬇ Export all data (JSON)</button>
            <button style={{ ...S.btn(false), width: "100%", justifyContent: "center" }}>🔒 Change password</button>
            <button style={{ ...S.btn(false), width: "100%", justifyContent: "center", color: "#A32D2D", borderColor: "#F7C1C1" }}>🗑 Delete account</button>
          </div>
        </div>
      </div>
    </div>
  );
}