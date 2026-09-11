"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminApi } from "@/lib/api";

export default function AdminLoginPage() {
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
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .admin-login-card {
          animation: fadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .admin-login-card.shake {
          animation: shake 0.45s ease both;
        }
        .admin-login-input {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 14px;
          border-radius: 10px;
          border: 1px solid rgba(148,163,184,0.2);
          background: rgba(15,23,42,0.7);
          color: #f8fafc;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
        }
        .admin-login-input:focus {
          border-color: #4ade80;
          box-shadow: 0 0 0 3px rgba(74,222,128,0.12);
        }
        .admin-login-input::placeholder { color: #475569; }
        .admin-login-btn {
          width: 100%;
          padding: 12px 16px;
          border-radius: 10px;
          border: none;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          background: linear-gradient(135deg, #4ade80 0%, #22d3ee 100%);
          color: #0d1117;
          position: relative;
          overflow: hidden;
        }
        .admin-login-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .admin-login-btn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(74,222,128,0.3);
        }
        .admin-login-btn:not(:disabled):active { transform: translateY(0); }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(ellipse at 60% 20%, rgba(74,222,128,0.06) 0%, transparent 60%), linear-gradient(160deg, #0d1117 0%, #0f172a 50%, #0a0e1a 100%)",
          padding: 20,
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        <div
          className={`admin-login-card${shake ? " shake" : ""}`}
          style={{
            width: "100%",
            maxWidth: 420,
            background: "rgba(15,23,42,0.75)",
            border: "1px solid rgba(148,163,184,0.12)",
            borderRadius: 20,
            padding: "32px 28px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03) inset",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
              padding: "5px 12px",
              borderRadius: 20,
              background: "rgba(74,222,128,0.08)",
              border: "1px solid rgba(74,222,128,0.15)",
            }}
          >
            <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 700, letterSpacing: 1 }}>
              ⬡ DEVTRACK ADMIN
            </span>
          </div>

          <h1 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 700, color: "#f8fafc", lineHeight: 1.2 }}>
            Welcome back
          </h1>
          <p style={{ margin: "0 0 28px", color: "#64748b", fontSize: 14 }}>
            Sign in to access the admin portal.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="admin-email"
                style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 500, marginBottom: 7 }}
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
            <div style={{ marginBottom: 22 }}>
              <label
                htmlFor="admin-password"
                style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 500, marginBottom: 7 }}
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
                  marginBottom: 18,
                  background: "rgba(220,38,38,0.1)",
                  color: "#fca5a5",
                  border: "1px solid rgba(220,38,38,0.2)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <span style={{ flexShrink: 0, marginTop: 1 }}>✕</span>
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
                "Continue to dashboard →"
              )}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <a
              href="/login"
              style={{ color: "#475569", textDecoration: "none", fontSize: 13 }}
            >
              ← Return to user login
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Inline spinner ─────────────────────────────────────────────────────────
function Spinner() {
  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .admin-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(13,17,23,0.3);
          border-top-color: #0d1117;
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
