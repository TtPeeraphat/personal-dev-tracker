"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminApi } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

// ── Types ────────────────────────────────────────────────────────────────────
type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt?: string;
};

type PageData = {
  users: UserRow[];
  total: number;
  page: number;
  totalPages: number;
};

const PAGE_SIZE = 20;

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

// ── Page component ────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const toast = useToast();

  const [search, setSearch]     = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage]         = useState(1);
  const [data, setData]         = useState<PageData | null>(null);
  const [loading, setLoading]   = useState(true);

  // Debounce search input by 350ms
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1); // Reset to page 1 on new search
    }, 350);
  };

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.users({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      });
      // Cast: API returns role as string, PageData expects the literal union
      setData(result as unknown as PageData);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to load users.", "error");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = data?.totalPages ?? 1;

  return (
    <div style={{ padding: "24px 24px 60px", maxWidth: 1200 }}>
      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 10, color: "#888780", fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4,
          }}
        >
          Management
        </div>
        <h2
          style={{
            margin: 0, fontSize: 22, fontWeight: 600,
            color: "#1a1a18", letterSpacing: "-0.01em",
          }}
        >
          User Management
        </h2>
        <p style={{ margin: "4px 0 0", color: "#888780", fontSize: 13 }}>
          {data ? `${data.total.toLocaleString()} registered users` : "Loading…"}
        </p>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: "flex", gap: 12, marginBottom: 18,
          flexWrap: "wrap", alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 260px", maxWidth: 400 }}>
          <span
            style={{
              position: "absolute", left: 12, top: "50%",
              transform: "translateY(-50%)", color: "#888780", fontSize: 15,
              pointerEvents: "none",
            }}
          >
            ⌕
          </span>
          <input
            id="user-search"
            type="search"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "8px 12px 8px 36px",
              borderRadius: 8,
              border: "0.5px solid rgba(0,0,0,0.12)",
              background: "#ffffff",
              color: "#1a1a18",
              fontSize: 13,
              fontFamily: "inherit",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#1D9E75";
              e.target.style.boxShadow = "0 0 0 3px rgba(29, 158, 117, 0.12)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(0,0,0,0.12)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchUsers}
          style={{
            padding: "8px 14px", borderRadius: 8,
            border: "0.5px solid rgba(0,0,0,0.12)",
            background: "#ffffff",
            color: "#5F5E5A", fontSize: 12, cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.15s",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#ffffff",
          border: "0.5px solid rgba(0,0,0,0.08)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr 100px 140px",
            padding: "10px 18px",
            borderBottom: "0.5px solid rgba(0,0,0,0.08)",
            fontSize: 10,
            fontWeight: 600,
            color: "#888780",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            background: "#FAFAF8",
          }}
        >
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Joined</span>
        </div>

        {/* Rows */}
        {loading ? (
          <SkeletonRows />
        ) : !data || data.users.length === 0 ? (
          <div
            style={{
              padding: "50px 20px",
              textAlign: "center",
              color: "#888780",
              fontSize: 13,
            }}
          >
            {debouncedSearch
              ? `No users found matching "${debouncedSearch}".`
              : "No users registered yet."}
          </div>
        ) : (
          data.users.map((user, idx) => (
            <UserRow
              key={user.id}
              user={user}
              isLast={idx === data.users.length - 1}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && data && data.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={data.total}
          limit={PAGE_SIZE}
          onPage={setPage}
        />
      )}
    </div>
  );
}

// ── UserRow ───────────────────────────────────────────────────────────────────
function UserRow({ user, isLast }: { user: UserRow; isLast: boolean }) {
  const isAdmin = user.role === "admin";
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.4fr 100px 140px",
        padding: "12px 18px",
        borderBottom: isLast ? "none" : "0.5px solid rgba(0,0,0,0.06)",
        alignItems: "center",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.background = "#F4F4F0")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.background = "transparent")
      }
    >
      {/* Name + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
            background: isAdmin ? "#E1F5EE" : "#F4F4F0",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 600,
            color: isAdmin ? "#0F6E56" : "#5F5E5A",
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a18" }}>
          {user.name}
        </span>
      </div>

      {/* Email */}
      <span style={{ fontSize: 13, color: "#5F5E5A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {user.email}
      </span>

      {/* Role badge */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "2px 8px",
          borderRadius: 20,
          fontSize: 10,
          fontFamily: "monospace",
          fontWeight: 600,
          background: isAdmin ? "#E1F5EE" : "#F4F4F0",
          color:      isAdmin ? "#0F6E56" : "#5F5E5A",
          border:     isAdmin ? "0.5px solid #9FE1CB" : "0.5px solid rgba(0,0,0,0.08)",
          width: "fit-content",
        }}
      >
        {isAdmin && <span style={{ fontSize: 7, lineHeight: 1 }}>●</span>}
        {user.role}
      </span>

      {/* Joined */}
      <span style={{ fontSize: 12, color: "#888780" }}>
        {formatDate(user.createdAt)}
      </span>
    </div>
  );
}

// ── Skeleton rows ─────────────────────────────────────────────────────────────
function SkeletonRows() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .sk-row {
          background: linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.07) 50%, rgba(0,0,0,0.04) 75%);
          background-size: 600px 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }
      `}</style>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr 100px 140px",
            padding: "12px 18px",
            borderBottom: i < 7 ? "0.5px solid rgba(0,0,0,0.06)" : "none",
            gap: 0,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="sk-row" style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0 }} />
            <div className="sk-row" style={{ height: 13, width: 110 }} />
          </div>
          <div className="sk-row" style={{ height: 13, width: "75%" }} />
          <div className="sk-row" style={{ height: 20, width: 50, borderRadius: 20 }} />
          <div className="sk-row" style={{ height: 12, width: 80 }} />
        </div>
      ))}
    </>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
}) {
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginTop: 16, flexWrap: "wrap", gap: 12,
      }}
    >
      <span style={{ fontSize: 12, color: "#888780" }}>
        Showing {from}–{to} of {total.toLocaleString()} users
      </span>

      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <PageBtn
          id="users-prev"
          label="← Prev"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        />

        {/* Page number pills */}
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          const p = totalPages <= 7
            ? i + 1
            : page <= 4
            ? i + 1
            : page >= totalPages - 3
            ? totalPages - 6 + i
            : page - 3 + i;
          if (p < 1 || p > totalPages) return null;
          return (
            <button
              key={p}
              onClick={() => onPage(p)}
              style={{
                width: 32, height: 32, borderRadius: 6, border: "0.5px solid",
                borderColor: p === page ? "#9FE1CB" : "rgba(0,0,0,0.1)",
                background: p === page ? "#E1F5EE" : "#ffffff",
                color: p === page ? "#0F6E56" : "#5F5E5A",
                fontSize: 12, fontWeight: p === page ? 600 : 400,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {p}
            </button>
          );
        })}

        <PageBtn
          id="users-next"
          label="Next →"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        />
      </div>
    </div>
  );
}

function PageBtn({
  id,
  label,
  disabled,
  onClick,
}: {
  id: string;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 12px", borderRadius: 6,
        border: "0.5px solid rgba(0,0,0,0.1)",
        background: "#ffffff",
        color: disabled ? "#D3D1C7" : "#5F5E5A",
        fontSize: 12, cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit", transition: "border-color 0.15s",
      }}
    >
      {label}
    </button>
  );
}
