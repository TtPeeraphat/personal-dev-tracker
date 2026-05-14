"use client";

import { S, NAV } from "@/constants/styles";

interface SidebarProps {
  section: string;
  setSection: (s: string) => void;
}

export function Sidebar({ section, setSection }: SidebarProps) {
  return (
    <div style={S.sidebar}>
      <div style={S.logo}>
        <div style={S.logoText}>
          dev<span style={{ color: "#1D9E75" }}>·</span>track
        </div>
        <div style={S.logoSub}>personal growth os</div>
      </div>

      <div style={{ padding: "8px 4px", flex: 1 }}>
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
          <div style={S.avatarCircle}>AP</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Anya P.</div>
            <div style={{ fontSize: 11, color: "#888780" }}>Pro plan</div>
          </div>
          {/* เพิ่มตรงนี้ */}
          <button
            style={{
              marginLeft:   "auto",
              background:   "transparent",
              border:       "none",
              cursor:       "pointer",
              fontSize:     16,
              color:        "#888780",
            }}
            title="ออกจากระบบ"
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