"use client";

import { useState } from "react";
import { loginApi, ApiError } from "@/lib/api";

export default function LoginPage() {
  const [isRegister, setIsRegister]           = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState("");
  const [successMsg, setSuccessMsg]           = useState("");
  const [form, setForm]                       = useState({
    email: "", password: "", firstName: "", lastName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (isForgotPassword) {
        handleForgotPassword();
      } else {
        handleSubmit();
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!form.email) {
      setError("กรุณากรอกอีเมลที่ใช้ลงทะเบียน");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await loginApi.forgotPassword({ email: form.email });
      setSuccessMsg(res.message);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("ไม่สามารถเชื่อมต่อ server ได้");
      }
    } finally {
      setLoading(false);
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
    setSuccessMsg("");

    try {
      if (isRegister) {
        const data = await loginApi.register({
          email:     form.email,
          password:  form.password,
          firstName: form.firstName,
          lastName:  form.lastName,
        });
        localStorage.setItem("token", data.token);
        localStorage.setItem("user",  JSON.stringify(data.user));
      } else {
        const data = await loginApi.login({
          email:    form.email,
          password: form.password,
        });
        localStorage.setItem("token", data.token);
        localStorage.setItem("user",  JSON.stringify(data.user));
      }

      window.location.href = "/";
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("ไม่สามารถเชื่อมต่อ server ได้");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "#FAFAF8", fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <div style={{
        background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)",
        borderRadius: 16, padding: "36px 32px", width: "100%", maxWidth: 400,
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
      }}>

        {/* Brand Header */}
        <div style={{
          fontFamily: "Georgia, serif", fontSize: 24,
          fontStyle: "italic", textAlign: "center", marginBottom: 4,
          color: "#1a1a18",
        }}>
          dev<span style={{ color: "#1D9E75" }}>·</span>track
        </div>
        <div style={{
          fontFamily: "monospace", fontSize: 11,
          color: "#888780", textAlign: "center", marginBottom: 24,
        }}>
          personal growth os
        </div>

        {/* Mode Toggle Pills (Login / Register) */}
        {!isForgotPassword ? (
          <div style={{
            display: "flex", background: "#F4F4F0",
            borderRadius: 8, padding: 3, marginBottom: 20,
          }}>
            {[
              { label: "เข้าสู่ระบบ",  val: false },
              { label: "สมัครสมาชิก", val: true  },
            ].map(({ label, val }) => (
              <button key={label}
                type="button"
                suppressHydrationWarning
                onClick={() => { setIsRegister(val); setError(""); setSuccessMsg(""); }}
                style={{
                  flex: 1, padding: "7px 0", borderRadius: 6, cursor: "pointer",
                  border: isRegister === val ? "0.5px solid rgba(0,0,0,0.08)" : "none",
                  background: isRegister === val ? "#fff" : "transparent",
                  color: isRegister === val ? "#1a1a18" : "#888780",
                  fontSize: 13, fontWeight: isRegister === val ? 500 : 400,
                  fontFamily: "inherit",
                }}
              >{label}</button>
            ))}
          </div>
        ) : (
          <div style={{ marginBottom: 20, textAlign: "center" }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1a1a18", margin: "0 0 4px" }}>
              ลืมรหัสผ่าน
            </h2>
            <p style={{ fontSize: 12, color: "#888780", margin: 0 }}>
              กรอกอีเมลของคุณเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่
            </p>
          </div>
        )}

        {/* Register First/Last Name Fields */}
        {isRegister && !isForgotPassword && (
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#888780", marginBottom: 5 }}>ชื่อ</div>
              <input style={iS} name="firstName" placeholder="สมชาย" suppressHydrationWarning
                value={form.firstName} onChange={handleChange} onKeyDown={handleKeyDown} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#888780", marginBottom: 5 }}>นามสกุล</div>
              <input style={iS} name="lastName" placeholder="ใจดี" suppressHydrationWarning
                value={form.lastName} onChange={handleChange} onKeyDown={handleKeyDown} />
            </div>
          </div>
        )}

        {/* Email Field */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#888780", marginBottom: 5 }}>อีเมล</div>
          <input style={iS} name="email" type="email" placeholder="you@example.com" suppressHydrationWarning
            value={form.email} onChange={handleChange} onKeyDown={handleKeyDown} />
        </div>

        {/* Password Field & Forgot Password Link */}
        {!isForgotPassword && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <div style={{ fontSize: 11, color: "#888780" }}>รหัสผ่าน</div>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(true); setError(""); setSuccessMsg(""); }}
                  style={{
                    border: "none", background: "transparent", color: "#1D9E75",
                    fontSize: 11, cursor: "pointer", padding: 0, fontWeight: 500,
                  }}
                >
                  ลืมรหัสผ่าน?
                </button>
              )}
            </div>
            <input style={iS} name="password" type="password" suppressHydrationWarning
              placeholder={isRegister ? "อย่างน้อย 6 ตัวอักษร" : "••••••••"}
              value={form.password} onChange={handleChange} onKeyDown={handleKeyDown} />
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div style={{
            background: "#FCEBEB", color: "#A32D2D", fontSize: 12,
            padding: "8px 12px", borderRadius: 7, marginBottom: 14,
          }}>{error}</div>
        )}

        {/* Success Banner */}
        {successMsg && (
          <div style={{
            background: "#E1F5EE", color: "#0F6E56", fontSize: 12,
            padding: "9px 12px", borderRadius: 7, marginBottom: 14, lineHeight: 1.4,
            border: "0.5px solid #9FE1CB",
          }}>{successMsg}</div>
        )}

        {/* Submit Button */}
        {!isForgotPassword ? (
          <button
            type="button"
            suppressHydrationWarning
            disabled={loading}
            onClick={handleSubmit}
            style={{
              width: "100%", padding: "10px 0", borderRadius: 8, border: "none",
              background: loading ? "#9FE1CB" : "#1D9E75", color: "#fff",
              fontSize: 14, fontWeight: 500, fontFamily: "inherit",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}
          >
            {loading ? "กำลังดำเนินการ..." : isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
          </button>
        ) : (
          <button
            type="button"
            suppressHydrationWarning
            disabled={loading}
            onClick={handleForgotPassword}
            style={{
              width: "100%", padding: "10px 0", borderRadius: 8, border: "none",
              background: loading ? "#9FE1CB" : "#1D9E75", color: "#fff",
              fontSize: 14, fontWeight: 500, fontFamily: "inherit",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}
          >
            {loading ? "กำลังส่งข้อมูล..." : "ส่งลิงก์กู้คืนรหัสผ่าน"}
          </button>
        )}

        {/* Back to Login Link when in Forgot Password mode */}
        {isForgotPassword && (
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <button
              type="button"
              onClick={() => { setIsForgotPassword(false); setError(""); setSuccessMsg(""); }}
              style={{
                border: "none", background: "transparent", color: "#5F5E5A",
                fontSize: 12, cursor: "pointer", padding: 0,
              }}
            >
              ← กลับไปหน้าเข้าสู่ระบบ
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

const iS: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "0.5px solid rgba(0,0,0,0.12)", background: "#fff",
  fontSize: 13, color: "#1a1a18", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};
