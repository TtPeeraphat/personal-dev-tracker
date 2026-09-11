"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminApi } from "@/lib/api";

// ── Inner form — uses useSearchParams, must be inside <Suspense> ──────────────
function AdminLoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [shake, setShake]       = useState(false);

  // Clear any stale session on mount
  useEffect(() => {
    document.cookie = "admin_session=; path=/; max-age=0; SameSite=Strict";
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await adminApi.login({ email, password });
      localStorage.setItem("adminToken", result.token);
      localStorage.setItem("adminUser", JSON.stringify(result.user));

      // Set a lightweight session cookie for Next.js edge middleware
      document.cookie = "admin_session=1; path=/; SameSite=Strict";

      // Redirect to the original destination (if preserved by middleware) or /admin
      const from = searchParams?.get("from") || "/admin";
      router.push(from);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to sign in.";
      setError(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`admin-login-card${shake ? " shake" : ""}`}
      style={{
        width: "100%",
        maxWidth: 400,
        background: "#ffffff",
        border: "0.5px solid rgba(0,0,0,0.08)",
        borderRadius: 16,
        padding: "36px 32px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
      }}
    >
      {/* Brand logo matching main website */}
      <div
        style={{
          fontFamily: "Georgia, serif",
          fontSize: 24,
          fontStyle: "italic",
          textAlign: "center",
          marginBottom: 4,
          color: "#1a1a18",
        }}
      >
        dev<span style={{ color: "#1D9E75" }}>·</span>track
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          marginBottom: 24,
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "#888780",
          }}
        >
          personal growth os
        </span>
        <span style={{ color: "#D3D1C7", fontSize: 10 }}>•</span>
        <span
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            padding: "1px 7px",
            borderRadius: 20,
            background: "#E1F5EE",
            color: "#0F6E56",
            fontWeight: 600,
          }}
        >
          admin portal
        </span>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            margin: "0 0 4px",
            fontSize: 18,
            fontWeight: 600,
            color: "#1a1a18",
            textAlign: "center",
          }}
        >
          Admin Sign In
        </h1>
        <p
          style={{
            margin: 0,
            color: "#888780",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          Enter your credentials to access the admin portal
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label
            htmlFor="admin-email"
            style={{
              display: "block",
              color: "#888780",
              fontSize: 11,
              fontWeight: 600,
              marginBottom: 5,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Email address
          </label>
          <input
            id="admin-email"
            type="email"
            className="admin-login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 20 }}>
          <label
            htmlFor="admin-password"
            style={{
              display: "block",
              color: "#888780",
              fontSize: 11,
              fontWeight: 600,
              marginBottom: 5,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            className="admin-login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            style={{
              marginBottom: 16,
              background: "#FCEBEB",
              color: "#A32D2D",
              border: "0.5px solid rgba(163,45,45,0.15)",
              borderRadius: 7,
              padding: "9px 12px",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ flexShrink: 0 }}>✕</span>
            <span>{error}</span>
          </div>
        )}

        <button
          id="admin-login-submit"
          type="submit"
          className="admin-login-btn"
          disabled={loading}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Spinner /> Verifying access…
            </span>
          ) : (
            "Continue to Dashboard →"
          )}
        </button>
      </form>

      <div style={{ marginTop: 20, textAlign: "center" }}>
        <a
          href="/login"
          style={{
            color: "#5F5E5A",
            textDecoration: "none",
            fontSize: 12,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#1D9E75")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#5F5E5A")}
        >
          ← Return to user login
        </a>
      </div>
    </div>
  );
}

// ── Fallback shown during Suspense hydration ──────────────────────────────────
function LoginSkeleton() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 400,
        background: "#ffffff",
        border: "0.5px solid rgba(0,0,0,0.08)",
        borderRadius: 16,
        padding: "36px 32px",
      }}
    >
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .sk-login {
          background: linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 6px;
        }
      `}</style>
      <div className="sk-login" style={{ height: 28, width: 140, margin: "0 auto 8px" }} />
      <div className="sk-login" style={{ height: 16, width: 180, margin: "0 auto 24px" }} />
      <div className="sk-login" style={{ height: 20, width: 120, margin: "0 auto 20px" }} />
      <div className="sk-login" style={{ height: 38, marginBottom: 14, borderRadius: 8 }} />
      <div className="sk-login" style={{ height: 38, marginBottom: 20, borderRadius: 8 }} />
      <div className="sk-login" style={{ height: 42, borderRadius: 8 }} />
    </div>
  );
}

// ── Page export — Suspense wraps the useSearchParams consumer ─────────────────
export default function AdminLoginPage() {
  return (
    <>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .admin-login-card {
          animation: fadeUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .admin-login-card.shake {
          animation: shake 0.45s ease both;
        }
        .admin-login-input {
          width: 100%;
          box-sizing: border-box;
          padding: 9px 12px;
          border-radius: 8px;
          border: 0.5px solid rgba(0,0,0,0.12);
          background: #ffffff;
          color: #1a1a18;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .admin-login-input:focus {
          border-color: #1D9E75;
          box-shadow: 0 0 0 3px rgba(29, 158, 117, 0.12);
        }
        .admin-login-input::placeholder { color: #888780; }
        .admin-login-btn {
          width: 100%;
          padding: 10px 0;
          border-radius: 8px;
          border: none;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s, opacity 0.15s;
          background: #1D9E75;
          color: #ffffff;
        }
        .admin-login-btn:disabled {
          background: #9FE1CB;
          cursor: not-allowed;
        }
        .admin-login-btn:not(:disabled):hover {
          background: #0F6E56;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(ellipse at 50% 20%, rgba(29, 158, 117, 0.06) 0%, transparent 60%), #FAFAF8",
          padding: 20,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Suspense boundary required by Next.js for useSearchParams() */}
        <Suspense fallback={<LoginSkeleton />}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </>
  );
}

// ── Inline spinner ─────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .admin-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
          flex-shrink: 0;
        }
      `}</style>
      <span className="admin-spinner" />
    </>
  );
}
