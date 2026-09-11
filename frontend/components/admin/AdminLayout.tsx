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
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif", background: "#FAFAF8" }}>
      {/* ── Mobile backdrop ───────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
            zIndex: 40, display: "block",
          }}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        style={{
          width: 220,
          background: "#ffffff",
          borderRight: "0.5px solid rgba(0,0,0,0.08)",
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
            padding: "20px 18px 16px",
            borderBottom: "0.5px solid rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontFamily: "Georgia, serif", fontSize: 17, fontStyle: "italic", color: "#1a1a18", letterSpacing: "-0.02em" }}>
            dev<span style={{ color: "#1D9E75" }}>·</span>track
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#888780", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
            <span>personal growth os</span>
            <span style={{ color: "#0F6E56", background: "#E1F5EE", padding: "1px 6px", borderRadius: 10, fontSize: 9, fontWeight: 600 }}>admin</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 10px", flex: 1 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#888780",
              letterSpacing: "0.08em",
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
                  gap: 9,
                  padding: "8px 10px",
                  borderRadius: 7,
                  margin: "1px 0",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  color: active ? "#0F6E56" : "#5F5E5A",
                  background: active ? "#E1F5EE" : "transparent",
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
                      background: "#1D9E75",
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
            padding: "14px 14px",
            borderTop: "0.5px solid rgba(0,0,0,0.08)",
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
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#E1F5EE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 600,
                color: "#0F6E56",
                flexShrink: 0,
              }}
            >
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#1a1a18",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {adminName}
              </div>
              <div style={{ fontSize: 11, color: "#888780" }}>Administrator</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "7px 12px",
              borderRadius: 7,
              border: "0.5px solid rgba(0,0,0,0.12)",
              background: "#ffffff",
              color: "#5F5E5A",
              fontSize: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
          >
            <span>↩</span> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content area ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", marginLeft: 220 }}>
        {/* Header */}
        <header
          style={{
            height: 56,
            background: "#ffffff",
            borderBottom: "0.5px solid rgba(0,0,0,0.08)",
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
              color: "#5F5E5A",
              cursor: "pointer",
              fontSize: 20,
              padding: 4,
            }}
          >
            ☰
          </button>

          {/* Page title */}
          <div style={{ flex: 1 }}>
            <h1
              style={{
                margin: 0,
                fontFamily: "Georgia, serif",
                fontSize: 19,
                fontWeight: 400,
                fontStyle: "italic",
                color: "#1a1a18",
                letterSpacing: "-0.02em",
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
                color: "#5F5E5A",
                fontSize: 12,
                padding: "6px 12px",
                borderRadius: 7,
                border: "0.5px solid rgba(0,0,0,0.08)",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                gap: 5,
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
            background: "#FAFAF8",
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
