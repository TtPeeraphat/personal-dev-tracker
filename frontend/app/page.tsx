"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { S, NAV } from "@/constants/styles";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar }  from "@/components/layout/Topbar";
import { Dashboard } from "@/components/sections/Dashboard";
import { Tasks }     from "@/components/sections/Tasks";
import { Goals }     from "@/components/sections/Goals";
import { Habits }    from "@/components/sections/Habits";
import { Reports }   from "@/components/sections/Reports";
import { Settings }  from "@/components/sections/Settings";
import { useTasks }  from "@/hooks/useTasks";
import { useHabits } from "@/hooks/useHabits";
import { useGoals } from "@/hooks/useGoals";
import { Journal } from "@/components/sections/Journal";

function PersonalDevTracker() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const taskProps = useTasks();
  const habitProps = useHabits();
  const goalProps = useGoals();

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard tasks={taskProps.tasks} habits={habitProps.habits} goals={goalProps.goals} setSection={setActiveSection} />;
      case "tasks":
        return <Tasks />;
      case "goals":
        return <Goals />;
      case "habits":
        return <Habits />;
      case "reports":
        return <Reports />;
      case "journal":
        return <Journal />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard tasks={taskProps.tasks} habits={habitProps.habits} goals={goalProps.goals} setSection={setActiveSection} />;
    }
  };

  return (
    <div style={S.app}>
      <Sidebar section={activeSection} setSection={setActiveSection} />
      <div style={S.main}>
        <Topbar section={activeSection} />
        <div style={S.content}>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router  = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");   // ไม่มี token → ไป login
    } else {
      setReady(true);             // มี token → แสดงหน้าหลัก
    }
  }, [router]);

  // ยังเช็คอยู่ → แสดงหน้าว่างก่อน ไม่ให้กระพริบ
  if (!ready) return null;

  // แสดง UI หลัก (PersonalDevTracker component)
  return <PersonalDevTracker />;
}