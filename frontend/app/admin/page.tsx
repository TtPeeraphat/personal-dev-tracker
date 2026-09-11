"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api";

type Summary = {
  totalUsers: number;
  totalTasks: number;
  totalGoals: number;
  totalHabits: number;
  activeTasks: number;
  completedGoals: number;
  activeHabits: number;
  adminAccounts: number;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentUsers, setRecentUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    adminApi.overview()
      .then((data) => {
        setSummary(data.summary);
        setRecentUsers(data.recentUsers);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load admin dashboard.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const statCards = useMemo(() => {
    if (!summary) return [];

    return [
      { label: "Total users", value: summary.totalUsers, accent: "#60a5fa" },
      { label: "Active tasks", value: summary.activeTasks, accent: "#34d399" },
      { label: "Completed goals", value: summary.completedGoals, accent: "#fbbf24" },
      { label: "Active habits", value: summary.activeHabits, accent: "#e879f9" },
    ];
  }, [summary]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f8fafc", color: "#0f172a" }}>
        Loading admin dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f8fafc", padding: 24 }}>
        <div style={{ maxWidth: 520, width: "100%", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
          <h2 style={{ marginTop: 0 }}>Admin access issue</h2>
          <p style={{ color: "#475569" }}>{error}</p>
          <button onClick={() => router.push("/admin/login")} style={{ padding: "10px 16px", border: "none", borderRadius: 8, background: "#0f172a", color: "#fff", cursor: "pointer" }}>
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)", color: "#0f172a", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px 60px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "#475569", textTransform: "uppercase", letterSpacing: 2, fontSize: 12, marginBottom: 6 }}>Admin dashboard</div>
            <h1 style={{ margin: 0, fontSize: 36 }}>Operations overview</h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <a href="/" style={{ textDecoration: "none", color: "#0f172a", background: "#fff", border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: 10, fontWeight: 600 }}>
              Go to app
            </a>
            <button onClick={handleLogout} style={{ border: "none", background: "#0f172a", color: "#fff", borderRadius: 10, padding: "10px 16px", cursor: "pointer", fontWeight: 700 }}>
              Logout
            </button>
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          {statCards.map((card) => (
            <div key={card.label} style={{ background: "rgba(255,255,255,0.82)", border: "1px solid #e2e8f0", borderRadius: 18, padding: 20, boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)" }}>
              <div style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>{card.label}</div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: card.accent }}>{card.value}</span>
                <span style={{ width: 12, height: 12, background: card.accent, borderRadius: "50%", display: "inline-block" }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.9fr", gap: 20 }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 20, boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 22 }}>Recent users</h2>
              <span style={{ color: "#64748b", fontSize: 12 }}>Latest activity</span>
            </div>

            {recentUsers.length === 0 ? (
              <div style={{ color: "#64748b" }}>No recent users yet.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ textAlign: "left", padding: "10px 8px", color: "#64748b" }}>Name</th>
                      <th style={{ textAlign: "left", padding: "10px 8px", color: "#64748b" }}>Email</th>
                      <th style={{ textAlign: "left", padding: "10px 8px", color: "#64748b" }}>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 8px" }}>{user.name}</td>
                        <td style={{ padding: "10px 8px", color: "#475569" }}>{user.email}</td>
                        <td style={{ padding: "10px 8px" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "6px 8px",
                            borderRadius: 999,
                            background: user.role === "admin" ? "#dcfce7" : "#e0f2fe",
                            color: user.role === "admin" ? "#166534" : "#075985",
                            fontSize: 12,
                            fontWeight: 700,
                          }}>
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 20, boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 22 }}>System snapshot</h2>

            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
                <div style={{ color: "#64748b", fontSize: 12 }}>Total tracked tasks</div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{summary?.totalTasks ?? 0}</div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
                <div style={{ color: "#64748b", fontSize: 12 }}>Total goals</div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{summary?.totalGoals ?? 0}</div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
                <div style={{ color: "#64748b", fontSize: 12 }}>Total habits</div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{summary?.totalHabits ?? 0}</div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
                <div style={{ color: "#64748b", fontSize: 12 }}>Admin accounts</div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{summary?.adminAccounts ?? 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
