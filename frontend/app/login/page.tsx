"use client";

import { useState } from "react";
// ใช้ request helper จาก lib/api แทน BASE_URL ที่ประกาศซ้ำ
import { loginApi } from "@/lib/api";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  // รองรับ field-level errors จาก zod validation ของ backend
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    email:     "",
    password:  "",
    firstName: "",
    lastName:  "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // ล้าง field error เมื่อผู้ใช้แก้ไข
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => ({ ...prev, [e.target.name]: "" }));
    }
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
    let data;


    if (isRegister) {
      data = await loginApi.register({
        email:     form.email,
        password:  form.password,
        firstName: form.firstName,
        lastName:  form.lastName,
      });
    } else {
      data = await loginApi.login({
        email:    form.email,
        password: form.password,
      });
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user",  JSON.stringify(data.user));
    window.location.href = "/";

  } catch (err: any) {
    setError(err.message || "เกิดข้อผิดพลาด");
  } finally {
    setLoading(false);
  }
};
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    ...styles.input,
    borderColor: fieldErrors[field] ? "#A32D2D" : "rgba(0,0,0,0.12)",
  });

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          dev<span style={{ color: "#1D9E75" }}>·</span>track
        </div>
        <div style={styles.logoSub}>personal growth os</div>

        <div style={styles.toggleRow}>
          <button
            style={styles.toggleBtn(!isRegister)}
            onClick={() => { setIsRegister(false); setError(""); setFieldErrors({}); }}
            suppressHydrationWarning
          >
            เข้าสู่ระบบ
          </button>
          <button
            style={styles.toggleBtn(isRegister)}
            onClick={() => { setIsRegister(true); setError(""); setFieldErrors({}); }}
            suppressHydrationWarning
          >
            สมัครสมาชิก
          </button>
        </div>

        {isRegister && (
          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>ชื่อ</label>
              <input
                style={inputStyle("firstName")}
                name="firstName"
                placeholder="สมชาย"
                value={form.firstName}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                suppressHydrationWarning
              />
              {fieldErrors.firstName && <span style={styles.fieldError}>{fieldErrors.firstName}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>นามสกุล</label>
              <input
                style={inputStyle("lastName")}
                name="lastName"
                placeholder="ใจดี"
                value={form.lastName}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                suppressHydrationWarning
              />
              {fieldErrors.lastName && <span style={styles.fieldError}>{fieldErrors.lastName}</span>}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label style={styles.label}>อีเมล</label>
          <input
            style={inputStyle("email")}
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            suppressHydrationWarning
          />
          {fieldErrors.email && <span style={styles.fieldError}>{fieldErrors.email}</span>}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={styles.label}>รหัสผ่าน</label>
          <input
            style={inputStyle("password")}
            name="password"
            type="password"
            placeholder={isRegister ? "อย่างน้อย 6 ตัวอักษร" : "••••••••"}
            value={form.password}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            suppressHydrationWarning
          />
          {fieldErrors.password && <span style={styles.fieldError}>{fieldErrors.password}</span>}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button
          style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
          suppressHydrationWarning
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

const styles = {
  page: {
    minHeight: "100vh", display: "flex",
    alignItems: "center", justifyContent: "center",
    background: "#FAFAF8", fontFamily: "'DM Sans', system-ui, sans-serif",
  } as React.CSSProperties,

  card: {
    background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)",
    borderRadius: 16, padding: "36px 32px", width: "100%", maxWidth: 400,
  } as React.CSSProperties,

  logo: {
    fontFamily: "Georgia, serif", fontSize: 24, fontStyle: "italic",
    letterSpacing: "-0.02em", marginBottom: 4, textAlign: "center",
  } as React.CSSProperties,

  logoSub: {
    fontFamily: "monospace", fontSize: 11, color: "#888780",
    textAlign: "center", marginBottom: 28,
  } as React.CSSProperties,

  toggleRow: {
    display: "flex", background: "#F4F4F0",
    borderRadius: 8, padding: 3, marginBottom: 24,
  } as React.CSSProperties,

  toggleBtn: (active: boolean): React.CSSProperties => ({
    flex: 1, padding: "7px 0", borderRadius: 6,
    border: active ? "0.5px solid rgba(0,0,0,0.08)" : "none",
    background: active ? "#fff" : "transparent",
    color: active ? "#1a1a18" : "#888780",
    fontSize: 13, fontWeight: active ? 500 : 400,
    cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
  }),

  row: { display: "flex", gap: 12, marginBottom: 12 } as React.CSSProperties,

  label: {
    display: "block", fontSize: 11, color: "#888780",
    marginBottom: 5, fontWeight: 500,
  } as React.CSSProperties,

  input: {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: "0.5px solid rgba(0,0,0,0.12)", background: "#fff",
    fontSize: 13, color: "#1a1a18", outline: "none",
    fontFamily: "inherit", boxSizing: "border-box" as const,
  } as React.CSSProperties,

  fieldError: {
    display: "block", fontSize: 11, color: "#A32D2D", marginTop: 3,
  } as React.CSSProperties,

  error: {
    background: "#FCEBEB", color: "#A32D2D", fontSize: 12,
    padding: "8px 12px", borderRadius: 7, marginBottom: 12,
  } as React.CSSProperties,

  submitBtn: {
    width: "100%", padding: "10px 0", borderRadius: 8,
    border: "none", background: "#1D9E75", color: "#fff",
    fontSize: 14, fontWeight: 500, cursor: "pointer",
    fontFamily: "inherit", transition: "opacity 0.15s",
  } as React.CSSProperties,
};
