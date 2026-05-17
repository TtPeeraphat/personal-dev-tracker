"use client";

import { useState, useEffect } from "react";
import { S, NAV } from "@/constants/styles";

interface SidebarProps {
  section: string;
  setSection: (s: string) => void;
}

interface LocalUser {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export function Sidebar({ section, setSection }: SidebarProps) {
  const [user, setUser] = useState<LocalUser | null>(null);

  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing user from localStorage", e);
        }
      }
    };

    loadUser();

    // Listen to profile changes in Settings page
    window.addEventListener("user-updated", loadUser);
    return () => window.removeEventListener("user-updated", loadUser);
  }, []);

  // Compute initials and name format dynamically
  const initials = user
    ? `${user.firstName?.substring(0, 1) || ""}${user.lastName?.substring(0, 1) || ""}`.toUpperCase() || "AP"
    : "AP";

  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Anya Petrova"
    : "Anya Petrova";

  return (
    <div style={S.sidebar}>
      <div style={S.logo}>
        <div style={S.logoText}>
          dev<span style={{ color: "#1D9E75" }}>·</span>track
        </div>
        <div style={S.logoSub}>personal growth os</div>
      </div>

      <div style={{ padding: "8px 4px", flex: 1, overflowY: "auto" }}>
        <div style={S.navSection}>Overview</div>
        {NAV.slice(0, 1).map((n) => (
          <div key={n.id} style={S.navItem(section === n.id)} onClick={() => setSection(n.id)}>
            <span style={{ fontSize: 14 }}>{n.icon}</span> {n.label}
          </div>
        ))}

        <div style={S.navSection}>Work</div>
        {NAV.slice(1, 4).map((n) => (
          <div key={n.id} style={S.navItem(section === n.id)} onClick={() => setSection(n.id)}>
            <span style={{ fontSize: 14 }}>{n.icon}</span> {n.label}
            {n.badge && <span style={S.navBadge(!!n.badgeRed)}>{n.badge}</span>}
          </div>
        ))}

        <div style={S.navSection}>Insights</div>
        {NAV.slice(4, 6).map((n) => (
          <div key={n.id} style={S.navItem(section === n.id)} onClick={() => setSection(n.id)}>
            <span style={{ fontSize: 14 }}>{n.icon}</span> {n.label}
          </div>
        ))}

        <div style={S.navSection}>System</div>
        {NAV.slice(6).map((n) => (
          <div key={n.id} style={S.navItem(section === n.id)} onClick={() => setSection(n.id)}>
            <span style={{ fontSize: 14 }}>{n.icon}</span> {n.label}
          </div>
        ))}
      </div>

      <div style={S.sideFooter}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 4px" }}>
          <div style={S.avatarCircle}>{initials}</div>
          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </div>
            <div style={{ fontSize: 11, color: "#888780" }}>Pro plan</div>
          </div>
          <button
            style={{
              background:   "transparent",
              border:       "none",
              cursor:       "pointer",
              fontSize:     16,
              color:        "#888780",
            }}
            title="Log out"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
          >
            ⇥
          </button>
        </div>
      </div>
    </div>
  );
}