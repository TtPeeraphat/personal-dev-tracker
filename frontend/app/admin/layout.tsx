import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin Portal — DevTrack",
  description: "DevTrack admin dashboard for system management.",
};

/**
 * Nested layout for all /admin/* routes.
 *
 * AdminShell (client component) checks the current pathname:
 * - /admin/login → renders children directly (no sidebar)
 * - all other /admin/* → wraps with ToastProvider + AdminLayout
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
