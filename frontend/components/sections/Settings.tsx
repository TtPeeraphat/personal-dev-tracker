"use client";

import { useState, useEffect } from "react";
import { S } from "@/constants/styles";
import { Toggle } from "@/components/ui/Toggle";
import { tasksApi, goalsApi, habitsApi } from "@/lib/api";

const NOTIFICATION_ITEMS = [
  { k: "daily",  label: "Daily reminder",      desc: "Remind me to check my tasks each morning" },
  { k: "habit",  label: "Habit check-in",       desc: "Evening nudge to log habits" },
  { k: "goal",   label: "Goal deadline alerts", desc: "Notify 3 days before a goal is due" },
  { k: "weekly", label: "Weekly report email",  desc: "Send weekly summary every Sunday" },
];

const PREFERENCE_ITEMS = [
  { k: "compact",     label: "Compact view",          desc: "Show more items with less padding" },
  { k: "mondayStart", label: "Week starts on Monday", desc: "Calendar and reports use Mon–Sun" },
  { k: "showDone",    label: "Show completed tasks",  desc: "Display completed items in task list" },
];

export function Settings() {
  const [profile, setProfile] = useState({
    firstName: "", lastName: "", email: "", timezone: "Asia/Bangkok (UTC+7)"
  });
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    daily: true, habit: true, goal: true, weekly: false,
  });
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    compact: false, mondayStart: true, showDone: true,
  });

  // ✅ dark mode — อ่านจาก localStorage ไม่ใช่ window.matchMedia ตรงๆ
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // โหลด user profile
    const localUser = localStorage.getItem("user");
    if (localUser) {
      try {
        const u = JSON.parse(localUser);
        setProfile({
          firstName: u.firstName || "",
          lastName:  u.lastName  || "",
          email:     u.email     || "",
          timezone:  u.timezone  || "Asia/Bangkok (UTC+7)",
        });
      } catch {}
    }

    // โหลด settings
    try {
      const n = localStorage.getItem("devtrack_notifications");
      if (n) setNotifs(JSON.parse(n));

      const p = localStorage.getItem("devtrack_preferences");
      if (p) setPrefs(JSON.parse(p));

      const d = localStorage.getItem("devtrack_theme");
      if (d) setDark(JSON.parse(d));
    } catch {}
  }, []);

  // ✅ dark mode เชื่อมกับ CSS variables จริง
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.setAttribute("data-theme", "dark");
    } else {
      root.setAttribute("data-theme", "light");
    }
    localStorage.setItem("devtrack_theme", JSON.stringify(dark));
  }, [dark]);

  const handleSaveProfile = () => {
    if (!profile.firstName.trim()) { alert("First name is required!"); return; }
    const localUser = localStorage.getItem("user");
    let u = {};
    try { u = JSON.parse(localUser || "{}"); } catch {}
    const updated = { ...u, ...profile };
    localStorage.setItem("user", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("user-updated"));
    alert("Profile saved!");
  };

  const toggleNotif = (k: string) => {
    const next = { ...notifs, [k]: !notifs[k] };
    setNotifs(next);
    localStorage.setItem("devtrack_notifications", JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("settings-updated"));
  };

  const togglePref = (k: string) => {
    const next = { ...prefs, [k]: !prefs[k] };
    setPrefs(next);
    localStorage.setItem("devtrack_preferences", JSON.stringify(next));
  };

  const handleExportData = async () => {
    try {
      const [tasks, habits, goals] = await Promise.all([
        tasksApi.getAll().catch(() => []),
        habitsApi.getAll().catch(() => []),
        goalsApi.getAll().catch(() => []),
      ]);
      const journal = JSON.parse(localStorage.getItem("devtrack_journal") || "[]");
      const user    = JSON.parse(localStorage.getItem("user") || "{}");
      const blob    = JSON.stringify({ exportedAt: new Date().toISOString(), user, tasks, habits, goals, journal }, null, 2);
      const a = document.createElement("a");
      a.href     = "data:text/json;charset=utf-8," + encodeURIComponent(blob);
      a.download = `devtrack_backup_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div style={S.grid2(false)}>
      {/* ── LEFT COLUMN ───────────────────────────── */}
      <div>
        {/* Profile */}
        <div style={{ ...S.card, marginBottom: 14 }}>
          <div style={S.cardTitle}>Profile</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ ...S.avatarCircle, width: 48, height: 48, fontSize: 15 }}>
              {(profile.firstName[0] || "") + (profile.lastName[0] || "") || "?"}
            </div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>
                {profile.firstName} {profile.lastName}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{profile.email || "—"}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            {[["First name", "firstName", "Anya"], ["Last name", "lastName", "Petrova"]].map(([label, key, ph]) => (
              <div key={key} style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{label}</div>
                <input
                  style={S.input}
                  value={(profile as any)[key]}
                  placeholder={ph}
                  onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          {[["Email address", "email", "you@example.com"], ["Timezone", "timezone", "Asia/Bangkok (UTC+7)"]].map(([label, key, ph]) => (
            <div key={key} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{label}</div>
              <input
                style={S.input}
                value={(profile as any)[key]}
                placeholder={ph}
                onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
            <button style={S.btn(true)} onClick={handleSaveProfile}>Save changes</button>
          </div>
        </div>

        {/* Notifications */}
        <div style={S.card}>
          <div style={S.cardTitle}>Notifications</div>
          {NOTIFICATION_ITEMS.map(({ k, label, desc }) => (
            <div key={k} style={{ display: "flex", alignItems: "center",
              justifyContent: "space-between", padding: "10px 0",
              borderBottom: "0.5px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: 13 }}>{label}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{desc}</div>
              </div>
              <Toggle on={notifs[k]} onToggle={() => toggleNotif(k)} />
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT COLUMN ──────────────────────────── */}
      <div>
        {/* Preferences */}
        <div style={{ ...S.card, marginBottom: 14 }}>
          <div style={S.cardTitle}>Preferences</div>
          {PREFERENCE_ITEMS.map(({ k, label, desc }) => (
            <div key={k} style={{ display: "flex", alignItems: "center",
              justifyContent: "space-between", padding: "10px 0",
              borderBottom: "0.5px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: 13 }}>{label}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{desc}</div>
              </div>
              <Toggle on={prefs[k]} onToggle={() => togglePref(k)} />
            </div>
          ))}
        </div>

        {/* Appearance — Dark Mode */}
        <div style={{ ...S.card, marginBottom: 14 }}>
          <div style={S.cardTitle}>Appearance</div>
          <div style={{ display: "flex", alignItems: "center",
            justifyContent: "space-between", padding: "10px 0" }}>
            <div>
              <div style={{ fontSize: 13 }}>Dark mode</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                {dark ? "Dark theme active" : "Light theme active"}
              </div>
            </div>
            {/* ✅ toggle ปุ่มนี้เชื่อม useEffect ด้านบนที่เปลี่ยน CSS variables จริง */}
            <Toggle on={dark} onToggle={() => setDark(d => !d)} />
          </div>
        </div>

        {/* Account & Data */}
        <div style={S.card}>
          <div style={S.cardTitle}>Account & Data</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              style={{ ...S.btn(false), width: "100%", justifyContent: "center" }}
              onClick={handleExportData}
            >⬇ Export all data (JSON)</button>
            <button
              style={{ ...S.btn(false), width: "100%", justifyContent: "center" }}
              onClick={() => alert("Change password — ยังไม่ได้ implement")}
            >🔒 Change password</button>
            <button
              style={{ ...S.btn(false), width: "100%", justifyContent: "center",
                color: "#A32D2D", borderColor: "#F7C1C1" }}
              onClick={() => {
                if (confirm("ลบบัญชีจริงๆ ไหม? ไม่สามารถย้อนกลับได้")) {
                  localStorage.clear();
                  window.location.href = "/login";
                }
              }}
            >🗑 Delete account</button>
          </div>
        </div>
      </div>
    </div>
  );
}
