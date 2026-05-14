"use client";

import { useState } from "react";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const [form, setForm] = useState({
    email:     "",
    password:  "",
    firstName: "",
    lastName:  "",
  });

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    // ── Validate ──────────────────────────────────────
    if (!form.email || !form.password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    if (isRegister && (!form.firstName || !form.lastName)) {
      setError("กรุณากรอกชื่อและนามสกุล");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body     = isRegister ? form : { email: form.email, password: form.password };

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "เกิดข้อผิดพลาด");
        return;
      }

      // ── เก็บ token และข้อมูล user ──────────────────
      localStorage.setItem("token",     data.token);
      localStorage.setItem("user",      JSON.stringify(data.user));

      // ── redirect ไปหน้าหลัก ────────────────────────
      window.location.href = "/";

    } catch {
      setError("ไม่สามารถเชื่อมต่อ server ได้");
    } finally {
      setLoading(false);
    }
  };

  // กด Enter แล้ว submit ได้เลย
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logo}>
          dev<span style={{ color: "#1D9E75" }}>·</span>track
        </div>
        <div style={styles.logoSub}>personal growth os</div>

        {/* Toggle Login / Register */}
        <div style={styles.toggleRow}>
          <button
            style={styles.toggleBtn(isRegister === false)}
            onClick={() => { setIsRegister(false); setError(""); }}
          >
            เข้าสู่ระบบ
          </button>
          <button
            style={styles.toggleBtn(isRegister === true)}
            onClick={() => { setIsRegister(true); setError(""); }}
          >
            สมัครสมาชิก
          </button>
        </div>

        {/* Register เพิ่มชื่อ-นามสกุล */}
        {isRegister && (
          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>ชื่อ</label>
              <input
                style={styles.input}
                name="firstName"
                placeholder="สมชาย"
                value={form.firstName}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>นามสกุล</label>
              <input
                style={styles.input}
                name="lastName"
                placeholder="ใจดี"
                value={form.lastName}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: 12 }}>
          <label style={styles.label}>อีเมล</label>
          <input
            style={styles.input}
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 16 }}>
          <label style={styles.label}>รหัสผ่าน</label>
          <input
            style={styles.input}
            name="password"
            type="password"
            placeholder={isRegister ? "อย่างน้อย 6 ตัวอักษร" : "••••••••"}
            value={form.password}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Error message */}
        {error && (
          <div style={styles.error}>{error}</div>
        )}

        {/* Submit Button */}
        <button
          style={styles.submitBtn}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? "กำลังดำเนินการ..."
            : isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ"
          }
        </button>

      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight:      "100vh",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    background:     "#FAFAF8",
    fontFamily:     "'DM Sans', system-ui, sans-serif",
  } as React.CSSProperties,

  card: {
    background:   "#fff",
    border:       "0.5px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding:      "36px 32px",
    width:        "100%",
    maxWidth:     400,
  } as React.CSSProperties,

  logo: {
    fontFamily:    "Georgia, serif",
    fontSize:      24,
    fontStyle:     "italic",
    letterSpacing: "-0.02em",
    marginBottom:  4,
    textAlign:     "center",
  } as React.CSSProperties,

  logoSub: {
    fontFamily:   "monospace",
    fontSize:     11,
    color:        "#888780",
    textAlign:    "center",
    marginBottom: 28,
  } as React.CSSProperties,

  toggleRow: {
    display:         "flex",
    background:      "#F4F4F0",
    borderRadius:    8,
    padding:         3,
    marginBottom:    24,
  } as React.CSSProperties,

  toggleBtn: (active: boolean): React.CSSProperties => ({
    flex:         1,
    padding:      "7px 0",
    borderRadius: 6,
    border:       active ? "0.5px solid rgba(0,0,0,0.08)" : "none",
    background:   active ? "#fff" : "transparent",
    color:        active ? "#1a1a18" : "#888780",
    fontSize:     13,
    fontWeight:   active ? 500 : 400,
    cursor:       "pointer",
    fontFamily:   "inherit",
    transition:   "all 0.15s",
  }),

  row: {
    display:      "flex",
    gap:          12,
    marginBottom: 12,
  } as React.CSSProperties,

  label: {
    display:      "block",
    fontSize:     11,
    color:        "#888780",
    marginBottom: 5,
    fontWeight:   500,
  } as React.CSSProperties,

  input: {
    width:        "100%",
    padding:      "9px 12px",
    borderRadius: 8,
    border:       "0.5px solid rgba(0,0,0,0.12)",
    background:   "#fff",
    fontSize:     13,
    color:        "#1a1a18",
    outline:      "none",
    fontFamily:   "inherit",
    boxSizing:    "border-box",
  } as React.CSSProperties,

  error: {
    background:   "#FCEBEB",
    color:        "#A32D2D",
    fontSize:     12,
    padding:      "8px 12px",
    borderRadius: 7,
    marginBottom: 12,
  } as React.CSSProperties,

  submitBtn: {
    width:        "100%",
    padding:      "10px 0",
    borderRadius: 8,
    border:       "none",
    background:   "#1D9E75",
    color:        "#fff",
    fontSize:     14,
    fontWeight:   500,
    cursor:       "pointer",
    fontFamily:   "inherit",
    transition:   "opacity 0.15s",
  } as React.CSSProperties,
};