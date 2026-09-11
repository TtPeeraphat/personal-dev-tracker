"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

// ── Types ────────────────────────────────────────────────────────────────────
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

// ── Stat card config ──────────────────────────────────────────────────────────
const STAT_CARDS = (s: Summary) => [
  {
    label: "Total Users",
    value: s.totalUsers,
    icon: "👤",
    accent: "#4ade80",
    bg: "rgba(74,222,128,0.08)",
    href: "/admin/users",
  },
  {
    label: "Active Tasks",
    value: s.activeTasks,
    icon: "✓",
    accent: "#60a5fa",
    bg: "rgba(96,165,250,0.08)",
    href: null,
  },
  {
    label: "Completed Goals",
    value: s.completedGoals,
    icon: "◎",
    accent: "#fbbf24",
    bg: "rgba(251,191,36,0.08)",
    href: null,
  },
  {
    label: "Active Habits",
    value: s.activeHabits,
    icon: "⚡",
    accent: "#e879f9",
    bg: "rgba(232,121,249,0.08)",
    href: null,
  },
];

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const toast = useToast();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .overview()
      .then((data) => setSummary(data.summary))
      .catch((err) => {
        toast(err instanceof Error ? err.message : "Failed to load overview.", "error");
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const statCards = useMemo(
    () => (summary ? STAT_CARDS(summary) : []),
    [summary]
  );

  if (loading) return <DashboardSkeleton />;

  return (
    <div style={{ padding: "28px 28px 60px", maxWidth: 1200 }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            color: "#4ade80",
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Overview
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            color: "#f8fafc",
            letterSpacing: "-0.02em",
          }}
        >
          Operations Dashboard
        </h2>
        <p style={{ margin: "6px 0 0", color: "#475569", fontSize: 14 }}>
          Real-time system metrics and activity summary.
        </p>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {statCards.map((card) => {
          const inner = (
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "20px 22px",
                backdropFilter: "blur(8px)",
                transition: "border-color 0.2s, transform 0.2s",
                cursor: card.href ? "pointer" : "default",
              }}
              onMouseEnter={(e) => {
                if (card.href) {
                  (e.currentTarget as HTMLDivElement).style.borderColor = card.accent + "55";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                  {card.label}
                </span>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: card.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                  }}
                >
                  {card.icon}
                </div>
              </div>
              <div
                style={{ fontSize: 36, fontWeight: 800, color: card.accent, lineHeight: 1 }}
              >
                {card.value.toLocaleString()}
              </div>
              {card.href && (
                <div
                  style={{ fontSize: 11, color: "#4ade80", marginTop: 10, opacity: 0.8 }}
                >
                  View all →
                </div>
              )}
            </div>
          );

          return card.href ? (
            <Link key={card.label} href={card.href} style={{ textDecoration: "none" }}>
              {inner}
            </Link>
          ) : (
            <div key={card.label}>{inner}</div>
          );
        })}
      </div>

      {/* System snapshot */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: "22px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#f8fafc" }}>
            System Snapshot
          </h3>
          <span style={{ fontSize: 12, color: "#4b5563" }}>All-time totals</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {[
            { label: "Total Tasks",   value: summary?.totalTasks   ?? 0 },
            { label: "Total Goals",   value: summary?.totalGoals   ?? 0 },
            { label: "Total Habits",  value: summary?.totalHabits  ?? 0 },
            { label: "Admin Accounts",value: summary?.adminAccounts ?? 0 },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: 11, color: "#4b5563", marginBottom: 6 }}>
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#f8fafc",
                }}
              >
                {item.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div style={{ padding: "28px 28px 60px", maxWidth: 1200 }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .sk {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 600px 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }
      `}</style>

      {/* Title skeleton */}
      <div className="sk" style={{ height: 14, width: 90, marginBottom: 10 }} />
      <div className="sk" style={{ height: 32, width: 260, marginBottom: 28 }} />

      {/* Cards skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              padding: "20px 22px",
            }}
          >
            <div className="sk" style={{ height: 12, width: 80, marginBottom: 16 }} />
            <div className="sk" style={{ height: 40, width: 70 }} />
          </div>
        ))}
      </div>

      {/* Snapshot skeleton */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: "22px 24px",
        }}
      >
        <div className="sk" style={{ height: 18, width: 140, marginBottom: 20 }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <div className="sk" style={{ height: 11, width: 80, marginBottom: 8 }} />
              <div className="sk" style={{ height: 28, width: 50 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
