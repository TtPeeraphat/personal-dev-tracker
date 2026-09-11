"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// ── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: "/admin",       label: "Dashboard",  icon: "⊞" },
  { href: "/admin/users", label: "Users",      icon: "👤" },
] as const;

// ── AdminLayout ───────────────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Derive current page title from nav items
  const currentPage =
    NAV_ITEMS.find((n) => pathname === n.href || (n.href !== "/admin" && pathname?.startsWith(n.href)))
      ?.label ?? "Admin";

  // Retrieve admin display name from localStorage (set at login)
  const adminName =
    typeof window !== "undefined"
      ? (() => {
          try {
            const user = JSON.parse(localStorage.getItem("adminUser") || "{}");
            return user.firstName ? `${user.firstName} ${user.lastName}` : "Admin";
          } catch {
            return "Admin";
          }
        })()
      : "Admin";

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    // Clear the session cookie used by the edge middleware
    document.cookie = "admin_session=; path=/; max-age=0; SameSite=Strict";
    router.push("/admin/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* ── Mobile backdrop ───────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 40, display: "block",
          }}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        style={{
          width: 230,
          background: "#0d1117",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          transform: sidebarOpen ? "translateX(0)" : "translateX(0)",
          transition: "transform 0.25s ease",
        }}
        className="admin-sidebar"
      >
        {/* Logo */}
        <div
          style={{
            padding: "22px 20px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#4ade80",
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            DevTrack
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", lineHeight: 1.2 }}>
            Admin Portal
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 10px", flex: 1 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#4b5563",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "0 8px",
              marginBottom: 8,
            }}
          >
            Navigation
          </div>
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && (pathname?.startsWith(item.href) ?? false));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 8,
                  margin: "2px 0",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#4ade80" : "#94a3b8",
                  background: active
                    ? "rgba(74, 222, 128, 0.08)"
                    : "transparent",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>
                  {item.icon}
                </span>
                {item.label}
                {active && (
                  <span
                    style={{
                      marginLeft: "auto",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#4ade80",
                      flexShrink: 0,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div
          style={{
            padding: "14px 18px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4ade80, #22d3ee)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "#0d1117",
                flexShrink: 0,
              }}
            >
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#f8fafc",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {adminName}
              </div>
              <div style={{ fontSize: 11, color: "#4b5563" }}>Administrator</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent",
              color: "#94a3b8",
              fontSize: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
          >
            <span>↩</span> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content area ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", marginLeft: 230 }}>
        {/* Header */}
        <header
          style={{
            height: 60,
            background: "#0d1117",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            gap: 16,
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="admin-hamburger"
            style={{
              display: "none",
              border: "none",
              background: "transparent",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: 20,
              padding: 4,
            }}
          >
            ☰
          </button>

          {/* Page title */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "#4b5563", marginBottom: 2 }}>
              Admin Portal
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                color: "#f8fafc",
              }}
            >
              {currentPage}
            </h1>
          </div>

          {/* Header actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: "#94a3b8",
                fontSize: 12,
                padding: "6px 12px",
                borderRadius: 7,
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s",
              }}
            >
              <span>↗</span> View app
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main
          style={{
            flex: 1,
            background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
            minHeight: 0,
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>

      {/* Responsive styles injected as a style tag */}
      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%) !important;
          }
          .admin-sidebar.open {
            transform: translateX(0) !important;
          }
          .admin-hamburger {
            display: flex !important;
          }
          /* Shift main content back on mobile */
          .admin-sidebar + div {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
