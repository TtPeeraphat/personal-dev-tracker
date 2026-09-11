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
    accent: "#185FA5",
    bg: "#E6F1FB",
    href: "/admin/users",
  },
  {
    label: "Active Tasks",
    value: s.activeTasks,
    icon: "✓",
    accent: "#1D9E75",
    bg: "#E1F5EE",
    href: null,
  },
  {
    label: "Completed Goals",
    value: s.completedGoals,
    icon: "◎",
    accent: "#854F0B",
    bg: "#FAEEDA",
    href: null,
  },
  {
    label: "Active Habits",
    value: s.activeHabits,
    icon: "⚡",
    accent: "#3C3489",
    bg: "#EEEDFE",
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
    <div style={{ padding: "24px 24px 60px", maxWidth: 1200 }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 10,
            color: "#888780",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Overview
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 600,
            color: "#1a1a18",
            letterSpacing: "-0.01em",
          }}
        >
          Operations Dashboard
        </h2>
        <p style={{ margin: "4px 0 0", color: "#888780", fontSize: 13 }}>
          Real-time system metrics and activity summary.
        </p>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {statCards.map((card) => {
          const inner = (
            <div
              style={{
                background: "#ffffff",
                border: "0.5px solid rgba(0,0,0,0.08)",
                borderRadius: 12,
                padding: "18px 20px",
                transition: "border-color 0.2s, transform 0.15s, box-shadow 0.15s",
                cursor: card.href ? "pointer" : "default",
              }}
              onMouseEnter={(e) => {
                if (card.href) {
                  (e.currentTarget as HTMLDivElement).style.borderColor = card.accent;
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.04)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,0,0,0.08)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 12, color: "#888780", fontWeight: 500 }}>
                  {card.label}
                </span>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: card.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: card.accent,
                  }}
                >
                  {card.icon}
                </div>
              </div>
              <div
                style={{ fontFamily: "monospace", fontSize: 28, fontWeight: 700, color: card.accent, lineHeight: 1 }}
              >
                {card.value.toLocaleString()}
              </div>
              {card.href && (
                <div
                  style={{ fontSize: 11, color: "#1D9E75", marginTop: 8, fontWeight: 500 }}
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
          background: "#ffffff",
          border: "0.5px solid rgba(0,0,0,0.08)",
          borderRadius: 12,
          padding: "20px 22px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1a1a18" }}>
            System Snapshot
          </h3>
          <span style={{ fontSize: 11, color: "#888780" }}>All-time totals</span>
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
                background: "#F4F4F0",
                borderRadius: 9,
                padding: "12px 14px",
              }}
            >
              <div style={{ fontSize: 11, color: "#888780", marginBottom: 4 }}>
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#1a1a18",
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
    <div style={{ padding: "24px 24px 60px", maxWidth: 1200 }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .sk {
          background: linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%);
          background-size: 600px 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }
      `}</style>

      {/* Title skeleton */}
      <div className="sk" style={{ height: 12, width: 80, marginBottom: 8 }} />
      <div className="sk" style={{ height: 26, width: 220, marginBottom: 24 }} />

      {/* Cards skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: "#ffffff",
              border: "0.5px solid rgba(0,0,0,0.08)",
              borderRadius: 12,
              padding: "18px 20px",
            }}
          >
            <div className="sk" style={{ height: 12, width: 80, marginBottom: 14 }} />
            <div className="sk" style={{ height: 32, width: 60 }} />
          </div>
        ))}
      </div>

      {/* Snapshot skeleton */}
      <div
        style={{
          background: "#ffffff",
          border: "0.5px solid rgba(0,0,0,0.08)",
          borderRadius: 12,
          padding: "20px 22px",
        }}
      >
        <div className="sk" style={{ height: 16, width: 130, marginBottom: 16 }} />
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
                background: "#F4F4F0",
                borderRadius: 9,
                padding: "12px 14px",
              }}
            >
              <div className="sk" style={{ height: 11, width: 70, marginBottom: 6 }} />
              <div className="sk" style={{ height: 24, width: 40 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
