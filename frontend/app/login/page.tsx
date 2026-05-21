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
      if (isRegister) {
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email:     form.email,
            password:  form.password,
            firstName: form.firstName,
            lastName:  form.lastName,
          }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.message || "เกิดข้อผิดพลาด"); return; }
        localStorage.setItem("token", data.token);
        localStorage.setItem("user",  JSON.stringify(data.user));

      } else {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email:    form.email,
            password: form.password,
          }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.message || "เกิดข้อผิดพลาด"); return; }
        localStorage.setItem("token", data.token);
        localStorage.setItem("user",  JSON.stringify(data.user));
      }

      window.location.href = "/";

    } catch {
      setError("ไม่สามารถเชื่อมต่อ server ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "#FAFAF8", fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{
        background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)",
        borderRadius: 16, padding: "36px 32px", width: "100%", maxWidth: 400,
      }}>

        {/* Logo */}
        <div style={{
          fontFamily: "Georgia, serif", fontSize: 24, fontStyle: "italic",
          textAlign: "center", marginBottom: 4,
        }}>
          dev<span style={{ color: "#1D9E75" }}>·</span>track
        </div>
        <div style={{
          fontFamily: "monospace", fontSize: 11, color: "#888780",
          textAlign: "center", marginBottom: 28,
        }}>
          personal growth os
        </div>

        {/* Toggle Login/Register */}
        <div style={{
          display: "flex", background: "#F4F4F0",
          borderRadius: 8, padding: 3, marginBottom: 24,
        }}>
          {[
            { label: "เข้าสู่ระบบ",   val: false },
            { label: "สมัครสมาชิก", val: true  },
          ].map(({ label, val }) => (
            <button
              key={label}
              onClick={() => { setIsRegister(val); setError(""); }}
              style={{
                flex: 1, padding: "7px 0", borderRadius: 6, cursor: "pointer",
                border: isRegister === val ? "0.5px solid rgba(0,0,0,0.08)" : "none",
                background: isRegister === val ? "#fff" : "transparent",
                color: isRegister === val ? "#1a1a18" : "#888780",
                fontSize: 13, fontWeight: isRegister === val ? 500 : 400,
                fontFamily: "inherit",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Name fields — Register only */}
        {isRegister && (
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#888780", marginBottom: 5 }}>ชื่อ</div>
              <input
                style={inputStyle}
                name="firstName" placeholder="สมชาย"
                value={form.firstName}
                onChange={handleChange} onKeyDown={handleKeyDown}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#888780", marginBottom: 5 }}>นามสกุล</div>
              <input
                style={inputStyle}
                name="lastName" placeholder="ใจดี"
                value={form.lastName}
                onChange={handleChange} onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#888780", marginBottom: 5 }}>อีเมล</div>
          <input
            style={inputStyle}
            name="email" type="email" placeholder="you@example.com"
            value={form.email}
            onChange={handleChange} onKeyDown={handleKeyDown}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#888780", marginBottom: 5 }}>รหัสผ่าน</div>
          <input
            style={inputStyle}
            name="password" type="password"
            placeholder={isRegister ? "อย่างน้อย 6 ตัวอักษร" : "••••••••"}
            value={form.password}
            onChange={handleChange} onKeyDown={handleKeyDown}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#FCEBEB", color: "#A32D2D", fontSize: 12,
            padding: "8px 12px", borderRadius: 7, marginBottom: 12,
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          disabled={loading}
          onClick={handleSubmit}
          style={{
            width: "100%", padding: "10px 0", borderRadius: 8,
            border: "none", background: loading ? "#9FE1CB" : "#1D9E75",
            color: "#fff", fontSize: 14, fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
          }}
        >
          {loading ? "กำลังดำเนินการ..." : isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
        </button>

      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "0.5px solid rgba(0,0,0,0.12)", background: "#fff",
  fontSize: 13, color: "#1a1a18", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};