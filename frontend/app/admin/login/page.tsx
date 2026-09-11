"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@devtrack.local");
  const [password, setPassword] = useState("Admin123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await adminApi.login({ email, password });
      localStorage.setItem("adminToken", result.token);
      localStorage.setItem("adminUser", JSON.stringify(result.user));
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #111827 100%)",
      padding: 20,
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "rgba(15, 23, 42, 0.82)",
        border: "1px solid rgba(148, 163, 184, 0.25)",
        borderRadius: 20,
        padding: 28,
        boxShadow: "0 20px 60px rgba(15, 23, 42, 0.45)",
      }}>
        <div style={{ color: "#f8fafc", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
          DevTrack Admin
        </div>
        <h1 style={{ margin: "0 0 8px", fontSize: 32, color: "#f8fafc" }}>Sign in</h1>
        <p style={{ margin: "0 0 24px", color: "#cbd5e1", fontSize: 14 }}>
          Access system insights and management tools.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", color: "#cbd5e1", fontSize: 12, marginBottom: 8 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@devtrack.local"
              style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              required
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", color: "#cbd5e1", fontSize: 12, marginBottom: 8 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: "1px solid #334155", background: "#0f172a", color: "#f8fafc" }}
              required
            />
          </div>

          {error && (
            <div style={{ marginBottom: 18, background: "rgba(239,68,68,0.12)", color: "#fecaca", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "10px 12px", fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 10,
              border: "none",
              background: loading ? "#64748b" : "#22c55e",
              color: "#fff",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 15,
            }}
          >
            {loading ? "Checking access..." : "Continue to dashboard"}
          </button>
        </form>

        <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", color: "#94a3b8", fontSize: 12 }}>
          <span>Default admin:</span>
          <span>admin@devtrack.local / Admin123!</span>
        </div>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <a href="/login" style={{ color: "#7dd3fc", textDecoration: "none", fontSize: 13 }}>
            Return to user login
          </a>
        </div>
      </div>
    </div>
  );
}
