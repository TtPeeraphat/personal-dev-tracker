"use client";

import { usePathname } from "next/navigation";
import AdminLayout from "./AdminLayout";
import { ToastProvider } from "@/hooks/useToast";

/**
 * AdminShell — client component that selectively applies the sidebar+header
 * shell depending on the current route.
 *
 * /admin/login → children only (the login page has its own full-screen UI)
 * /admin/*     → ToastProvider + AdminLayout (sidebar + header)
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    // Login page manages its own full-screen layout
    return <>{children}</>;
  }

  return (
    <ToastProvider>
      <AdminLayout>{children}</AdminLayout>
    </ToastProvider>
  );
}
