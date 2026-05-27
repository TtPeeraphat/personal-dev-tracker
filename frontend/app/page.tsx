"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { S } from "@/constants/styles";
import { Sidebar }   from "@/components/layout/Sidebar";
import { Topbar }    from "@/components/layout/Topbar";
import { Dashboard } from "@/components/sections/Dashboard";
import { Tasks }     from "@/components/sections/Tasks";
import { Goals }     from "@/components/sections/Goals";
import { Habits }    from "@/components/sections/Habits";
import { Reports }   from "@/components/sections/Reports";
import { Settings }  from "@/components/sections/Settings";
import { Journal }   from "@/components/sections/Journal";
import { useTasks }  from "@/hooks/useTasks";
import { useHabits } from "@/hooks/useHabits";
import { useGoals }  from "@/hooks/useGoals";
import { useIsMobile } from "@/hooks/useIsMobile";
import { NAV } from "@/constants/styles";

useEffect(() => {
  window.onerror = (msg, src, line, col, err) => {
    document.body.innerHTML = `<pre style="padding:20px;color:red">${msg}\n${src}:${line}\n${err?.stack}</pre>`;
  };
}, []);

// ── Main app shell — แสดงเมื่อยืนยัน token แล้วเท่านั้น ────────────────
function PersonalDevTracker() {
  const isMobile = useIsMobile()
  const [activeSection, setActiveSection] = useState("dashboard")

  // Lift state ขึ้นมาที่นี่ เพื่อแชร์ข้อมูลกับ Dashboard โดยไม่ต้อง fetch ซ้ำ
  const taskProps  = useTasks();
  const habitProps = useHabits();
  const goalProps  = useGoals();
  

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <Dashboard
            tasks={taskProps.tasks}
            habits={habitProps.habits}
            goals={goalProps.goals}
            setSection={setActiveSection}
            isMobile={isMobile}
          />
        );
      // ส่ง props ลงไปเพื่อให้ section components ใช้ข้อมูลที่ดึงมาแล้ว
      // แทนที่จะเรียก hook ใหม่ภายใน (ซึ่งจะทำให้ fetch ซ้ำ)
      case "tasks":   return <Tasks   {...taskProps}  />;
      case "goals":   return <Goals   {...goalProps}  />;
      case "habits":  return <Habits  {...habitProps} />;
      case "reports": return <Reports tasks={taskProps.tasks} habits={habitProps.habits} goals={goalProps.goals} />;
      case "journal": return <Journal />;
      case "settings": return <Settings />;
      default:
        return (
          <Dashboard
            tasks={taskProps.tasks}
            habits={habitProps.habits}
            goals={goalProps.goals}
            setSection={setActiveSection}
          />
        );
    }
  };

  return (
    <div style={S.app}>
      {/* ซ่อน sidebar บน mobile */}
      {!isMobile && (
        <Sidebar section={activeSection} setSection={setActiveSection} />
      )}
      
      <div style={S.main}>
        <Topbar
          section={activeSection}
          setSection={setActiveSection}
          // ส่ง data สำเร็จรูปให้ Topbar ใช้เลย ไม่ต้อง re-fetch
          tasks={taskProps.tasks}
          habits={habitProps.habits}
          goals={goalProps.goals}
        />
        <div style={{ ...S.content, padding: isMobile ? "16px 12px" : "22px 24px" }}>
          {renderSection()}
        </div>
       {/* Bottom Nav สำหรับ mobile */}
        {isMobile && (
          <div style={{
            display: "flex", position: "fixed", bottom: 0, left: 0, right: 0,
            background: "var(--surface)", borderTop: "0.5px solid var(--border)",
            padding: "8px 0", zIndex: 50,
          }}>
            {NAV.slice(0, 5).map(item => (
              <div
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 3, cursor: "pointer",
                  color: activeSection === item.id ? "#1D9E75" : "#888780",
                  fontSize: 10,
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Guard — ตรวจสอบ token กับ server ก่อนแสดงหน้าหลัก ──────────────────────
export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    // ยืนยัน token กับ server จริง — ไม่ใช่แค่เช็คว่ามีใน localStorage
    // ป้องกัน token หมดอายุหรือถูก tamper แล้วยังเข้าหน้าหลักได้
    authApi.me()
      .then(() => setReady(true))
      .catch(() => {
        // token ไม่ valid → ล้างและกลับไป login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
      });
  }, [router]);
  

  if (!ready) return null;

  return <PersonalDevTracker />;
}
